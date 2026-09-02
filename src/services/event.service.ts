
import { eventRepository } from '../repository/event.repository.js';
import { BoothType, EventStatus, Role, SearchEventRequest, UpdateEventRequest } from '../types/types.js';
import { accountService } from './account.service.js';
import { authRepository } from '../repository/auth.repository.js';
import { currencyRepository } from '../repository/currency.repository.js';
import { CreateEventRequest } from '../types/types.js';
import { bookmarkRepository } from '../repository/bookmark.repository.js';
import { PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-03-25.dahlia',
});

const getUserEvents = async (username: string, page: number, limit: number) => {
    const user = await accountService.getUserByUsername(username);
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    let eventsData: any[] = [];
    let meta;

    if (user.role === Role.HOST) {
        const { events, total } = await eventRepository.getEventsByHostId(user.id, page, limit);
        const totalPages = Math.ceil(total / limit);
        eventsData = events.map(event => {
            const total_capacity = event.total_slots;
            const total_bookings = total_capacity - event.available_slots;
            const thumbnail = event.images[0]?.url || null;

            return {
                id: event.id,
                title: event.title,
                slug: event.slug,
                address: event.address,
                start_date: event.start_date,
                end_date: event.end_date,
                status: event.status,
                thumbnail: thumbnail,
                total_capacity,
                total_bookings,
                available_booths: event.available_slots,
            };
        });

        meta = {
            totalItems: total,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        };
    }
    return { user, eventsData, meta };
}

const getEventsBySearchRequest = async (searchRequest: SearchEventRequest, userId?: number) => {
    const { events, total } = await eventRepository.getEventsBySearchRequest(searchRequest);
    const totalPages = Math.ceil(total / searchRequest.limit!);

    let bookmarkedEventIds = new Set<number>();
    if (userId) {
        bookmarkedEventIds = await bookmarkRepository.findBookmarkedEventIdsByUserId(userId, events.map(event => event.id));
    }

    const formattedEvents = events.map(event => {
        const total_capacity = event.total_slots;
        const total_bookings = total_capacity - event.available_slots;
        const thumbnail = event.images[0]?.url || null;
        return {
            id: event.id,
            title: event.title,
            slug: event.slug,
            address: event.address,
            start_date: event.start_date,
            end_date: event.end_date,
            thumbnail: thumbnail,
            total_capacity,
            total_bookings,
            latitude: event.latitude,
            longitude: event.longitude,
            available_booths: event.available_slots,
            is_bookmarked: bookmarkedEventIds.has(event.id),
        };
    });
    return { formattedEvents, total, totalPages };
}

const createEvent = async (hostId: number, eventData: CreateEventRequest, currencyCode: string) => {
    const host = await authRepository.findUserById(hostId);
    if (!host?.stripe_account_id || host?.stripe_payout_enabled === false) {
        throw new Error("STRIPE_ACCOUNT_NOT_FOUND");
    }
    if (!currencyCode) {
        throw new Error("CURRENCY_NOT_FOUND");
    }
    const rate = await currencyRepository.getCurrencyRate(currencyCode.toUpperCase());
    if (!rate) {
        throw new Error("CURRENCY_NOT_FOUND");
    }
    eventData.currency_code = currencyCode.toUpperCase();

    const newEvent = await eventRepository.createEvent(hostId, eventData);
    return newEvent
}

const updateEvent = async (hostId: number, slug: string, data: UpdateEventRequest, currency: string) => {
    const event = await eventRepository.getEventBySlug(slug, [EventStatus.DRAFT]);
    if (!event) {
        throw new Error('EVENT_NOT_FOUND');
    }

    const rate = await currencyRepository.getCurrencyRate(currency.toUpperCase());
    if (!rate) {
        throw new Error('CURRENCY_NOT_FOUND');
    }
    data.currency_code = currency.toUpperCase();
    if (event.host_id !== hostId) {
        throw new Error('EVENT_NOT_OWNED_BY_HOST');
    }
    await eventRepository.updateEvent(event.id, data);
}

const publishEvent = async (hostId: number, slug: string) => {
    const event = await eventRepository.getEventBySlug(slug, [EventStatus.DRAFT, EventStatus.CLOSED]);
    if (!event) {
        throw new Error('EVENT_NOT_FOUND');
    }

    if (event.host_id !== hostId) {
        throw new Error('EVENT_NOT_OWNED_BY_HOST');
    }

    const host = await authRepository.findUserById(hostId);
    if (!host?.stripe_account_id || host?.stripe_payout_enabled === false) {
        throw new Error('STRIPE_ACCOUNT_NOT_FOUND');
    }

    await eventRepository.updateEventStatus(event.id, EventStatus.PUBLISHED);

}

const closeEvent = async (hostId: number, slug: string) => {
    const event = await eventRepository.getEventBySlug(slug);
    if (!event) {
        throw new Error('EVENT_NOT_FOUND');
    }

    if (event.host_id !== hostId) {
        throw new Error('EVENT_NOT_OWNED_BY_HOST');
    }

    await eventRepository.updateEventStatus(event.id, EventStatus.CLOSED);
}

const findEventsByHostId = async (hostId: number, page: number, limit: number, status: EventStatus | undefined, search: string | undefined) => {
    const { events, total } = await eventRepository.getEventsByHostId(hostId, page, limit, status, search);
    const totalPages = Math.ceil(total / limit);
    const formattedEvents = events.map(event => {
        const total_capacity = event.total_slots;
        const total_bookings = total_capacity - event.available_slots;
        const thumbnail = event.images[0]?.url || null;

        return {
            id: event.id,
            title: event.title,
            slug: event.slug,
            address: event.address,
            start_date: event.start_date,
            end_date: event.end_date,
            latitude: event.latitude,
            longitude: event.longitude,
            status: event.status,
            thumbnail: thumbnail,
            total_capacity,
            total_bookings,
            available_booths: event.available_slots,
        };
    });
    return { formattedEvents, total, totalPages };
}

const getEventDetails = async (slug: string | string[], userId?: number, currencyCode?: string) => {
    const event = await eventRepository.getEventBySlug(slug as string, [EventStatus.PUBLISHED, EventStatus.CLOSED, EventStatus.CANCELLED]);

    if (!event) {
        throw new Error('EVENT_NOT_FOUND');
    }
    const totalCapacity = event.total_slots;
    const availableBooths = event.available_slots;

    let targetRate = 1;
    let baseRate = 1;
    if (currencyCode) {
        const targetCurrency = await currencyRepository.getCurrencyRate(currencyCode.toUpperCase());
        const eventCurrency = await currencyRepository.getCurrencyRate(event.currency_code.toUpperCase());
        if (!targetCurrency) throw new Error(`Currency ${currencyCode} not supported.`);
        targetRate = Number(targetCurrency.rate);
        baseRate = eventCurrency ? Number(eventCurrency.rate) : 1;
    }

    const isBookmarked = userId ? await bookmarkRepository.isBookmarked(userId, event.id) : false;
    const bookmarksCount = (event as any)._count?.bookmarks ?? 0;

    return {
        ...event,
        booths: event.booths.map(b => ({
            ...b,
            type: b.type as BoothType,
            price: Number(((currencyCode ? (Number(b.price) / baseRate) * targetRate : Number(b.price)) * 1.05).toFixed(2))
        })),
        status: event.status as unknown as EventStatus,
        total_capacity: totalCapacity,
        total_bookings: totalCapacity - availableBooths,
        available_booths: availableBooths,
        bookmarks_count: bookmarksCount,
        is_bookmarked: isBookmarked,
        username: event.host?.username || '',
        profile_photo: event.host?.profile_photo || null
    };
}

const getHostEventDetails = async (slug: string | string[], userId: number, currencyCode: string) => {
    const event = await eventRepository.getEventDetailsBySlug(slug as string);
    if (!event) {
        throw new Error('EVENT_NOT_FOUND');
    }
    if (event.host_id !== userId)
        throw new Error('EVENT_NOT_OWNED_BY_HOST');

    const targetCurrency = await currencyRepository.getCurrencyRate(currencyCode.toUpperCase());
    if (!targetCurrency) throw new Error(`Currency ${currencyCode} not supported.`);

    const eventCurrency = await currencyRepository.getCurrencyRate(event.currency_code.toUpperCase());
    const baseRate = eventCurrency ? Number(eventCurrency.rate) : 1;
    const targetRate = Number(targetCurrency.rate);

    const totalCapacity = event.total_slots;
    const availableBooths = event.available_slots;

    return {
        ...event,
        booths: event.booths.map((b: any) => ({
            ...b,
            base_price: Number(Number(b.price).toFixed(2)),
            price: Number(((Number(b.price) / baseRate) * targetRate * 1.05).toFixed(2))
        })),
        total_capacity: totalCapacity,
        total_bookings: totalCapacity - availableBooths,
        available_booths: availableBooths,
        username: event.host?.username || '',
        profile_photo: event.host?.profile_photo || null
    };
};

const getHostEditEvent = async (slug: string | string[], userId: number, currencyCode: string) => {
    const event = await eventRepository.getEventDetailsBySlug(slug as string);
    if (!event) throw new Error('EVENT_NOT_FOUND');

    if (event.host_id !== userId) throw new Error('EVENT_NOT_OWNED_BY_HOST');

    const targetCurrency = await currencyRepository.getCurrencyRate(currencyCode.toUpperCase());
    if (!targetCurrency) throw new Error('CURRENCY_NOT_SUPPORTED');

    const eventCurrency = await currencyRepository.getCurrencyRate(event.currency_code.toUpperCase());
    const baseRate = eventCurrency ? Number(eventCurrency.rate) : 1;
    const targetRate = Number(targetCurrency.rate);

    const totalCapacity = event.total_slots;
    const availableBooths = event.available_slots;

    return {
        ...event,
        booths: event.booths.map((b: any) => ({
            ...b,
            price: Number(((Number(b.price) / baseRate) * targetRate * 1.05).toFixed(2))
        })),
        total_capacity: totalCapacity,
        total_bookings: totalCapacity - availableBooths,
        available_booths: availableBooths,
        username: event.host?.username || '',
        bookmarks_count: event.bookmarks_count,
        booking_summaries: event.booking_summaries
    };
}

const createBoothCheckoutSession = async (vendorId: number, email: string, username: string, role: string, eventId: number, boothId: number, currencyCode: string) => {
    const event = await eventRepository.getEventById(eventId);
    if (!event) throw new Error('EVENT_NOT_FOUND');
    if (event.status !== EventStatus.PUBLISHED) throw new Error('EVENT_NOT_AVAILABLE');
    if (event.end_date && new Date(event.end_date) <= new Date()) throw new Error('EVENT_EXPIRED');

    const host = await authRepository.findUserById(event.host_id);
    if (!host?.stripe_account_id || host.stripe_payout_enabled === false) {
        throw new Error('HOST_STRIPE_NOT_CONNECTED');
    }

    const booth = event.booths.find(b => b.id === boothId);
    if (!booth || booth.type !== BoothType.AVAILABLE) throw new Error('BOOTH_UNAVAILABLE');

    const hasPending = await eventRepository.hasPendingBooking(vendorId);
    if (hasPending) throw new Error('PENDING_BOOKING_EXISTS');

    const targetCurrency = await currencyRepository.getCurrencyRate(currencyCode.toUpperCase());
    if (!targetCurrency) throw new Error('CURRENCY_NOT_SUPPORTED');

    const eventCurrency = await currencyRepository.getCurrencyRate(event.currency_code.toUpperCase());
    const baseRate = eventCurrency ? Number(eventCurrency.rate) : 1;
    const calculatedPrice = (Number(booth.price) / baseRate) * Number(targetCurrency.rate) * 1.05;

    const bookingRecord = await eventRepository.createBoothBooking(
        vendorId, currencyCode, boothId, booth.name, event.title, calculatedPrice
    );

    try {
        const isZeroDecimal = ['JPY', 'KRW', 'VND', 'CLP', 'LAK'].includes(currencyCode.toUpperCase());
        const unitAmount = isZeroDecimal ? Math.round(calculatedPrice) : Math.round(calculatedPrice * 100);

        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: currencyCode.toLowerCase(),
                    product_data: { name: `${event.title} - ${booth.name}`, images: event.images?.map(i => i.url) },
                    unit_amount: unitAmount,
                },
                quantity: 1,
            }],
            payment_intent_data: {
                application_fee_amount: isZeroDecimal ? Math.round(calculatedPrice * 0.05) : Math.round(calculatedPrice * 100 * 0.05),
                transfer_data: { destination: host.stripe_account_id },
            },
            success_url: `${process.env.FRONTEND_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_DOMAIN}/dashboard/${encodeURIComponent(event.slug)}`,
            metadata: { userId: vendorId.toString(), bookingId: bookingRecord.id.toString(), boothId: boothId.toString(), eventId: eventId.toString() },
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
        });

        await eventRepository.updateBoothBooking(bookingRecord.id, session.id);
        return session.url;
    } catch (err) {
        await eventRepository.confirmBoothBookingWithStatusUpdate(bookingRecord.id, boothId, PaymentStatus.FAILED, BoothType.AVAILABLE);
        throw err;
    }
}
export const eventService = {
    getUserEvents,
    getEventsBySearchRequest,
    createEvent,
    updateEvent,
    publishEvent,
    closeEvent,
    findEventsByHostId,
    getEventDetails,
    getHostEventDetails,
    getHostEditEvent,
    createBoothCheckoutSession
}