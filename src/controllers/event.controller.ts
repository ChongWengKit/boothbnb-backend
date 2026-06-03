import { ApiResponse, BoothType, CreateEventRequest, EventStatus, SearchEventRequest, SearchEventResponse, UpdateEventRequest } from '../types/types.js';
import * as eventService from '../services/event.service.js';
import type { Request, Response } from 'express';
import { Role } from '../types/types.js';
import { EventParamsResponse } from '../types/types.js';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import * as bookmarkService from '../services/bookmark.service.js';
import { PaymentStatus, EmailLogCategory, EmailLogStatus } from '@prisma/client';
import { findUserById } from '../services/auth.service.js';
import * as emailService from '../services/mail.service.js';
import { User } from '../types/types.js'
import { getCurrencyRate } from '../services/currency.service.js';
import { getCurrency } from '../services/currency.service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-03-25.dahlia',
});

export const searchEvents = async (req: Request, res: Response<ApiResponse<SearchEventResponse>>) => {
    try {
        const { title, longitude, latitude, start_date, end_date, category, page, limit, ne_lat, ne_lng, sw_lat, sw_lng, extent, type } = req.query;

        const searchRequest: SearchEventRequest = {
            title: typeof title === 'string' ? title : undefined,
            longitude: typeof longitude === 'string' ? parseFloat(longitude) : undefined,
            latitude: typeof latitude === 'string' ? parseFloat(latitude) : undefined,
            start_date: typeof start_date === 'string' ? new Date(start_date) : undefined,
            end_date: typeof end_date === 'string' ? new Date(end_date) : undefined,
            category: typeof category === 'string' ? category : undefined,
            ne_lat: typeof ne_lat === 'string' ? parseFloat(ne_lat) : undefined,
            ne_lng: typeof ne_lng === 'string' ? parseFloat(ne_lng) : undefined,
            sw_lat: typeof sw_lat === 'string' ? parseFloat(sw_lat) : undefined,
            sw_lng: typeof sw_lng === 'string' ? parseFloat(sw_lng) : undefined,
            type: typeof type === 'string' ? type : undefined,
            page: typeof page === 'string' ? parseInt(page) : 1,
            limit: typeof limit === 'string' ? parseInt(limit) : 12,
        };
        const { events, total } = await eventService.getEventsBySearchRequest(searchRequest);
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

        return res.status(200).json({
            success: true,
            message: 'Search successfully',
            data: formattedEvents,
            meta: {
                totalItems: total,
                totalPages,
                currentPage: searchRequest.page!,
                itemsPerPage: searchRequest.limit!,
                hasNextPage: searchRequest.page! < totalPages,
                hasPreviousPage: searchRequest.page! > 1
            }
        });
    } catch (error) {

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const createEvent = async (req: Request<{}, {}, CreateEventRequest>, res: Response<ApiResponse<any>>) => {
    try {
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const hostId = req.user.id;
        if (req.user.role !== Role.HOST) {
            return res.status(403).json({ success: false, message: 'Forbidden. Only hosts can create events.' });
        }

        const host = await findUserById(parseInt(hostId));
        if (!host?.stripe_account_id || host?.stripe_payout_enabled === false) {
            return res.status(400).json({
                success: false,
                message: 'You must connect your Stripe account before creating an event.'
            });
        }

        const eventData: CreateEventRequest = req.body;
        const currencyCode = req.headers['currency'] as string;
        if (!currencyCode) {
            return res.status(400).json({ success: false, message: 'Currency header is required.' });
        }
        const rate = await getCurrencyRate(currencyCode.toUpperCase());
        if (!rate) {
            return res.status(400).json({ success: false, message: `Currency ${currencyCode} is not supported.` });
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
            isNaN(new Date(eventData.start_date).getTime()) ||
            isNaN(new Date(eventData.end_date).getTime()) ||
            new Date(eventData.start_date) < new Date() ||
            new Date(eventData.end_date) <= new Date(eventData.start_date)
        ) {
            return res.status(400).json({ success: false, message: 'Missing or invalid event fields.' });
        }

        const newEvent = await eventService.createEvent(parseInt(hostId), eventData);
        return res.status(201).json({
            success: true,
            message: 'Event created successfully.',
            data: newEvent
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateEvent = async (req: Request<{ slug: string }, {}, UpdateEventRequest>, res: Response<ApiResponse<any>>) => {
    try {
        const { slug } = req.params;
        const updateData = req.body;
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const hostId = parseInt(req.user.id);

        if (req.user.role !== Role.HOST) {
            return res.status(403).json({ success: false, message: 'Forbidden. Only hosts can update events.' });
        }

        const event = await eventService.getEventBySlug(slug, [EventStatus.DRAFT]);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        const currencyCode = req.headers['currency'] as string;
        if (!currencyCode) {
            return res.status(400).json({ success: false, message: 'Currency header is required.' });
        }
        const rate = await getCurrencyRate(currencyCode.toUpperCase());
        if (!rate) {
            return res.status(400).json({ success: false, message: `Currency ${currencyCode} is not supported.` });
        }
        updateData.currency_code = currencyCode.toUpperCase();
        if (event.host_id !== hostId) {
            return res.status(403).json({ success: false, message: 'Forbidden. You do not own this event.' });
        }
        if (
            !updateData.title ||
            !updateData.start_date ||
            !updateData.end_date ||
            !updateData.category ||
            !updateData.longitude ||
            !updateData.currency_code ||
            !updateData.latitude ||
            !updateData.address ||
            !updateData.description ||
            updateData.title.length < 3 ||
            updateData.title.length > 100 ||
            updateData.description.length < 10 ||
            updateData.description.length > 2000 ||
            isNaN(new Date(updateData.start_date).getTime()) ||
            isNaN(new Date(updateData.end_date).getTime()) ||
            new Date(updateData.start_date) < new Date() ||
            new Date(updateData.end_date) <= new Date(updateData.start_date)
        ) {
            return res.status(400).json({ success: false, message: 'Missing or invalid event fields.' });
        }
        await eventService.updateEvent(event.id, updateData);

        return res.status(200).json({ success: true, message: 'Event updated successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const publishEvent = async (req: Request<{ slug: string }>, res: Response<ApiResponse<any>>) => {
    try {
        const { slug } = req.params;
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const hostId = parseInt(req.user.id);

        const event = await eventService.getEventBySlug(slug, [EventStatus.DRAFT, EventStatus.CLOSED]);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.host_id !== hostId) {
            return res.status(403).json({ success: false, message: 'Forbidden. You do not own this event.' });
        }

        const host = await findUserById(hostId);
        if (!host?.stripe_account_id || host?.stripe_payout_enabled === false) {
            return res.status(400).json({
                success: false,
                message: 'You must connect your Stripe account before publishing an event.'
            });
        }

        await eventService.updateEventStatus(event.id, EventStatus.PUBLISHED);

        return res.status(200).json({ success: true, message: 'Event published successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const closeEvent = async (req: Request<{ slug: string }>, res: Response<ApiResponse<any>>) => {
    try {
        const { slug } = req.params;
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const hostId = parseInt(req.user.id);

        const event = await eventService.getEventBySlug(slug);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.host_id !== hostId) {
            return res.status(403).json({ success: false, message: 'Forbidden. You do not own this event.' });
        }

        await eventService.updateEventStatus(event.id, EventStatus.CLOSED);

        return res.status(200).json({ success: true, message: 'Event Closed successfully' });
    } catch (error) {

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


export const findEventsByHostId = async (req: Request, res: Response<ApiResponse<SearchEventResponse>>) => {
    try {
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const user_id = req.user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as EventStatus | undefined;
        const search = req.query.search as string | undefined;

        if (req.user.role !== Role.HOST) {
            return res.status(403).json({ success: false, message: 'Forbidden. Only hosts can access this resource.' });
        }

        const { events, total } = await eventService.getEventsByHostId(parseInt(user_id), page, limit, status, search);
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
        return res.status(200).json({
            success: true,
            message: 'Search successfully',
            data: formattedEvents,
            meta: {
                totalItems: total,
                totalPages,
                currentPage: page,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const getEventBySlug = async (
    req: Request,
    res: Response<ApiResponse<EventParamsResponse>>
) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        const event = await eventService.getEventBySlug(slug as string, [EventStatus.PUBLISHED, EventStatus.CLOSED, EventStatus.CANCELLED]);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const active_booths = event.booths.filter(b => b.type !== BoothType.LOCKED);
        const total_capacity = active_booths.length;
        const available_booths = active_booths.filter(b => b.type === BoothType.AVAILABLE).length;
        const total_bookings = total_capacity - available_booths;

        let userId: number | undefined;
        if (req.user) {
            userId = Number(req.user.id);
        } else {
            const authHeader = req.headers.authorization;
            if (authHeader?.startsWith('bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const secret = process.env.JWT_SECRET;
                    if (secret) {
                        if (token) {
                            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as User; userId = Number(decoded.id);
                            userId = Number(decoded.id);

                        }
                    }
                } catch (e) {
                }
            }
        }

        const bookmarks_count = (event as any)._count?.bookmarks ?? 0;
        let is_bookmarked = false;
        if (userId) {
            is_bookmarked = await bookmarkService.isBookmarked(userId, event.id);
        }

        const currencyCode = req.headers['currency'] as string;
        let targetRate = 1;
        let baseRate = 1;

        if (currencyCode) {
            const targetCurrency = await getCurrencyRate(currencyCode.toUpperCase());
            if (!targetCurrency) {
                return res.status(400).json({ success: false, message: `Currency ${currencyCode} not supported.` });
            }
            targetRate = Number(targetCurrency.rate);

            const eventCurrency = await getCurrency(event.currency_code.toUpperCase());
            if (eventCurrency) {
                baseRate = Number(eventCurrency.rate);
            }
        }
        else {

            return res.status(400).json({ success: false, message: `Currency not supported.` });
        }
        const responseData: EventParamsResponse = {
            ...event,
            booths: event.booths.map(b => ({
                ...b,
                type: b.type as BoothType,
                price: Number(((currencyCode ? (Number(b.price) / baseRate) * targetRate : Number(b.price)) * 1.05).toFixed(2))
            })),
            host_id: event.host_id,
            username: event.host?.username || '',
            profile_photo: event.host?.profile_photo || null,
            status: event.status as EventStatus,
            latitude: event.latitude,
            longitude: event.longitude,
            total_capacity,
            total_bookings,
            available_booths,
            bookmarks_count,
            is_bookmarked
        };
        return res.status(200).json({
            success: true,
            message: 'Event get successfully',
            data: responseData
        });
    } catch (error) {

        return res.status(500).json({ success: false, message: 'Internal server error' });

    }
};

export const getEventDetailsBySlug = async (
    req: Request,
    res: Response<ApiResponse<any>>
) => {
    try {
        const { slug } = req.params;
        if (!slug) {

            return res.status(404).json({ success: false, message: 'Forbidden. Only the host can view event details.' });
        }
        const event = await eventService.getEventDetailsBySlug(slug as string);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const eventData = event as any;
        if (req.user.role !== Role.HOST || eventData.host_id !== parseInt(req.user.id)) {

            return res.status(403).json({ success: false, message: 'Forbidden. Only the host can view event details.' });
        }
        const currencyCode = req.headers['currency'] as string;
        let targetRate = 1;
        let baseRate = 1;
        if (currencyCode) {
            const targetCurrency = await getCurrencyRate(currencyCode.toUpperCase());
            if (!targetCurrency) {

                return res.status(400).json({ success: false, message: `Currency ${currencyCode} not supported.` });
            }
            targetRate = Number(targetCurrency.rate);

            const eventCurrency = await getCurrency(event.currency_code.toUpperCase());
            if (eventCurrency) {
                baseRate = Number(eventCurrency.rate);
            }
        }
        else {

            return res.status(400).json({ success: false, message: `Currency not supported.` });
        }
        const active_booths = eventData.booths.filter((b: any) => b.type !== BoothType.LOCKED);
        const total_capacity = active_booths.length;
        const available_booths = active_booths.filter((b: any) => b.type === BoothType.AVAILABLE).length;
        const total_bookings = total_capacity - available_booths;
        console.log(eventData.booking_summaries)
        return res.status(200).json({
            success: true,
            message: 'Event details retrieved successfully',
            data: {
                ...eventData,
                booths: eventData.booths.map((b: any) => ({
                    ...b,
                    base_price: Number((Number(b.price)).toFixed(2)),
                    price: Number(((Number(b.price) / baseRate) * targetRate * 1.05).toFixed(2))
                })),
                total_capacity,
                total_bookings,
                available_booths,
                username: eventData.host?.username || '',
                profile_photo: eventData.host?.profile_photo || null,
                bookmarks_count: eventData.bookmarks_count,
                booking_summaries: eventData.booking_summaries
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getEventEditBySlug = async (
    req: Request,
    res: Response<ApiResponse<any>>
) => {
    try {
        const { slug } = req.params;
        if (!slug) {

            return res.status(404).json({ success: false, message: 'Forbidden. Only the host can view event details.' });
        }
        const event = await eventService.getEventDetailsBySlug(slug as string);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const eventData = event as any;
        if (req.user.role !== Role.HOST || eventData.host_id !== parseInt(req.user.id)) {

            return res.status(403).json({ success: false, message: 'Forbidden. Only the host can view event details.' });
        }
        const currencyCode = req.headers['currency'] as string;
        let targetRate = 1;
        let baseRate = 1;
        if (currencyCode) {
            const targetCurrency = await getCurrencyRate(currencyCode.toUpperCase());
            if (!targetCurrency) {

                return res.status(400).json({ success: false, message: `Currency ${currencyCode} not supported.` });
            }
            targetRate = Number(targetCurrency.rate);

            const eventCurrency = await getCurrency(event.currency_code.toUpperCase());
            if (eventCurrency) {
                baseRate = Number(eventCurrency.rate);
            }
        }
        else {

            return res.status(400).json({ success: false, message: `Currency not supported.` });
        }
        const active_booths = eventData.booths.filter((b: any) => b.type !== BoothType.LOCKED);
        const total_capacity = active_booths.length;
        const available_booths = active_booths.filter((b: any) => b.type === BoothType.AVAILABLE).length;
        const total_bookings = total_capacity - available_booths;
        return res.status(200).json({
            success: true,
            message: 'Event details retrieved successfully',
            data: {
                ...eventData,
                booths: eventData.booths.map((b: any) => ({
                    ...b,
                    price: Number(((Number(b.price) / baseRate) * targetRate * 1.05).toFixed(2))
                })),
                total_capacity,
                total_bookings,
                available_booths,
                username: eventData.host?.username || '',
                bookmarks_count: eventData.bookmarks_count,
                booking_summaries: eventData.booking_summaries
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const checkoutByUpdateEventReserved = async (
    req: Request<{ eventId: string, boothId: string }>,
    res: Response<ApiResponse<any>>
) => {
    try {
        const { eventId, boothId } = req.body;
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const vendorId = parseInt(req.user.id);


        const event = await eventService.getEventById(parseInt(eventId));
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        const currencyCode = (req.headers['currency'] as string).toUpperCase();
        let targetRate = 1;
        let baseRate = 1;

        const targetCurrency = await getCurrencyRate(currencyCode);
        if (!targetCurrency) {
            return res.status(400).json({ success: false, message: `Currency ${currencyCode} not supported.` });
        }
        targetRate = Number(targetCurrency.rate);

        const eventCurrency = await getCurrency(event.currency_code.toUpperCase());
        if (eventCurrency) {
            baseRate = Number(eventCurrency.rate);
        }
        const host = await findUserById(event.host_id);
        if (!host || !host.stripe_account_id || host.stripe_payout_enabled === false) {
            return res.status(400).json({
                success: false,
                message: 'This event host has not connected their Stripe account yet.'
            });
        }
        const booth = event.booths.find(b => b.id === parseInt(boothId));
        if (!booth) {
            return res.status(404).json({ success: false, message: 'Booth not found' });
        }
        const currentDate = new Date();
        const eventStartDate = new Date(event.start_date);
        if (currentDate > eventStartDate) {
            return res.status(400).json({ success: false, message: 'Event has already started' });
        }
        if (booth.type !== BoothType.AVAILABLE) {
            return res.status(400).json({ success: false, message: 'Booth is not available' });
        }
        const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'LAK'];

        const isZeroDecimal = zeroDecimalCurrencies.includes(currencyCode.toUpperCase());

        const calculatedPrice = (Number(booth.price) / baseRate) * targetRate * 1.05;

        const unitAmount = isZeroDecimal
            ? Math.round(calculatedPrice)
            : Math.round(calculatedPrice * 100);
        const [bookingRecord, boothResult] = await eventService.createBoothBooking(vendorId, currencyCode, parseInt(boothId), booth.name, event.title, Number(calculatedPrice));
        const bookingId = bookingRecord.id;
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
            price_data: {
                currency: currencyCode.toLowerCase(),
                product_data: {
                    name: event.title,
                    images: event.images?.map(image => image.url) || [],
                },
                unit_amount: unitAmount,
            },
            quantity: 1,
        }];
        const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
            customer_email: req.user.email,
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_DOMAIN}/dashboard/${encodeURIComponent(event.slug)}`,
            payment_intent_data: {
                application_fee_amount: isZeroDecimal
                    ? Math.round(calculatedPrice * 0.05)
                    : Math.round(calculatedPrice * 100 * 0.05),
                transfer_data: {
                    destination: host.stripe_account_id,
                },
            },
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
            metadata: {
                userId: vendorId.toString(),
                bookingId: bookingId.toString(),
                boothId: boothId.toString(),
                eventId: eventId.toString(),
                eventTitle: event.title,
                boothName: booth.name,
                userRole: req.user.role,
                userEmail: req.user.email,
                userName: req.user.username,
                amountPaid: (unitAmount / 100).toString(),
                currency: currencyCode,
                hostStripeAccount: host.stripe_account_id,
                originalBoothPrice: booth.price.toString(),
                eventCurrency: event.currency_code
            }
        });
        await eventService.updateBoothBooking(bookingId, session.id);

        return res.status(200).json({ success: true, message: 'Booth reserved successfully', data: session.url });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error', });
    }
}
