
import { eventRepository } from '../repository/event.repository.js';
import { BoothType, EventStatus, Role, SearchEventRequest, UpdateEventRequest } from '../types/types.js';
import { accountService } from './account.service.js';
import { authRepository } from '../repository/auth.repository.js';
import { currencyRepository } from '../repository/currency.repository.js';
import { CreateEventRequest } from '../types/types.js';
import { bookmarkRepository } from '../repository/bookmark.repository.js';
import { validateCloudinaryImageUrls } from '../lib/validation.js';
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
            const locked_count = event.booths.filter(b => b.type === BoothType.LOCKED).length;
            const total_bookings = event.booths.filter(b => b.type === BoothType.RESERVED || b.type === BoothType.SOLD).length;
            const total_capacity = event._count.booths - locked_count;
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
                available_booths: total_capacity - total_bookings,
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

const getEventsBySearchRequest = async (searchRequest: SearchEventRequest) => {
    const { events, total } = await eventRepository.getEventsBySearchRequest(searchRequest);
    const totalPages = Math.ceil(total / searchRequest.limit!);

    const formattedEvents = events.map(event => {
        const locked_count = event.booths.filter(b => b.type === BoothType.LOCKED).length;
        const total_bookings = event.booths.filter(b => b.type === BoothType.RESERVED || b.type === BoothType.SOLD).length;
        const total_capacity = event._count.booths - locked_count;
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
            available_booths: total_capacity - total_bookings,
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

    if (
        !eventData.title ||
        !eventData.start_date ||
        !eventData.end_date ||
        !eventData.category ||
        !eventData.currency_code ||
        !eventData.longitude ||
        !eventData.latitude ||
        !eventData.address ||
        !eventData.description ||
        eventData.title.length < 3 ||
        eventData.title.length > 100 ||
        eventData.description.length < 10 ||
        eventData.description.length > 2000 ||
        eventData.address.length < 1 ||
        eventData.address.length > 255 ||
        isNaN(new Date(eventData.start_date).getTime()) ||
        isNaN(new Date(eventData.end_date).getTime()) ||
        new Date(eventData.start_date) < new Date() ||
        new Date(eventData.end_date) <= new Date(eventData.start_date) ||
        eventData.latitude < -90 ||
        eventData.latitude > 90 ||
        eventData.longitude < -180 ||
        eventData.longitude > 180 ||
        !validateCloudinaryImageUrls(eventData.images)
    ) {
        throw new Error("INVALID_EVENT_DATA");
    }

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
    if (
        !data.title ||
        !data.start_date ||
        !data.end_date ||
        !data.category ||
        !data.longitude ||
        !data.currency_code ||
        !data.latitude ||
        !data.address ||
        !data.description ||
        data.title.length < 3 ||
        data.title.length > 100 ||
        data.description.length < 10 ||
        data.description.length > 2000 ||
        data.address.length < 1 ||
        data.address.length > 255 ||
        isNaN(new Date(data.start_date).getTime()) ||
        isNaN(new Date(data.end_date).getTime()) ||
        new Date(data.start_date) < new Date() ||
        new Date(data.end_date) <= new Date(data.start_date) ||
        data.latitude < -90 ||
        data.latitude > 90 ||
        data.longitude < -180 ||
        data.longitude > 180 ||
        (data.images !== undefined && !validateCloudinaryImageUrls(data.images))
    ) {
        throw new Error("INVALID_EVENT_DATA");
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
        const locked_count = event.booths.filter(b => b.type === BoothType.LOCKED).length;
        const total_bookings = event.booths.filter(b => b.type === BoothType.RESERVED || b.type === BoothType.SOLD).length;
        const total_capacity = event._count.booths - locked_count;
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
            available_booths: total_capacity - total_bookings,
        };
    });
    return { formattedEvents, total, totalPages };
}

const getEventDetails = async (slug: string | string[], userId?: number, currencyCode?: string) => {
    const event = await eventRepository.getEventBySlug(slug as string, [EventStatus.PUBLISHED, EventStatus.CLOSED, EventStatus.CANCELLED]);

    if (!event) {
        throw new Error('EVENT_NOT_FOUND');
    }
    const activeBooths = event.booths.filter(b => b.type !== BoothType.LOCKED);
    const totalCapacity = activeBooths.length;
    const availableBooths = activeBooths.filter(b => b.type === BoothType.AVAILABLE).length;

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

    const activeBooths = event.booths.filter((b: any) => b.type !== BoothType.LOCKED);
    const totalCapacity = activeBooths.length;
    const availableBooths = activeBooths.filter((b: any) => b.type === BoothType.AVAILABLE).length;

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

    const activeBooths = event.booths.filter((b: any) => b.type !== BoothType.LOCKED);
    const totalCapacity = activeBooths.length;
    const availableBooths = activeBooths.filter((b: any) => b.type === BoothType.AVAILABLE).length;

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

    const host = await authRepository.findUserById(event.host_id);
    if (!host?.stripe_account_id || host.stripe_payout_enabled === false) {
        throw new Error('HOST_STRIPE_NOT_CONNECTED');
    }

    const booth = event.booths.find(b => b.id === boothId);
    if (!booth || booth.type !== BoothType.AVAILABLE) throw new Error('BOOTH_UNAVAILABLE');

    const targetCurrency = await currencyRepository.getCurrencyRate(currencyCode.toUpperCase());
    if (!targetCurrency) throw new Error('CURRENCY_NOT_SUPPORTED');

    const eventCurrency = await currencyRepository.getCurrencyRate(event.currency_code.toUpperCase());
    const baseRate = eventCurrency ? Number(eventCurrency.rate) : 1;
    const calculatedPrice = (Number(booth.price) / baseRate) * Number(targetCurrency.rate) * 1.05;

    const [bookingRecord] = await eventRepository.createBoothBooking(
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