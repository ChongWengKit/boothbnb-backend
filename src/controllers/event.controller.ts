import { ApiResponse, CreateEventRequest, EventStatus, SearchEventRequest, SearchEventResponse, UpdateEventRequest } from '../types/types.js';
import type { Request, Response } from 'express';
import { Role } from '../types/types.js';
import { EventParamsResponse } from '../types/types.js';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { User } from '../types/types.js'
import { eventService } from '../services/event.service.js';
import { parseUserId } from '../lib/validation.js';

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
        if (searchRequest.page! < 1 || searchRequest.limit! < 1 || searchRequest.limit! > 100) {
            return res.status(400).json({ success: false, message: 'Invalid pagination parameters.' });
        }
        const result = await eventService.getEventsBySearchRequest(searchRequest);
        const { formattedEvents, total, totalPages } = result;
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
        const hostId = parseUserId(req.user.id);
        if (hostId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }
        if (req.user.role !== Role.HOST) {
            return res.status(403).json({ success: false, message: 'Forbidden. Only hosts can create events.' });
        }

        const newEvent = await eventService.createEvent(hostId, req.body, req.headers['currency'] as string);
        return res.status(201).json({
            success: true,
            message: 'Event created successfully.',
            data: newEvent
        });

    } catch (error: any) {
        if (error.message === 'INVALID_EVENT_DATA') {
            return res.status(400).json({ success: false, message: 'Invalid event data' });
        }
        if (error.message === 'STRIPE_ACCOUNT_NOT_FOUND') {
            return res.status(400).json({ success: false, message: 'Stripe account not found' });
        }
        if (error.message === 'CURRENCY_NOT_FOUND') {
            return res.status(400).json({ success: false, message: 'Currency not found' });
        }
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
        const hostId = parseUserId(req.user.id);
        if (hostId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }

        if (req.user.role !== Role.HOST) {
            return res.status(403).json({ success: false, message: 'Forbidden. Only hosts can update events.' });
        }
        await eventService.updateEvent(hostId, slug, updateData, req.headers['currency'] as string);

        return res.status(200).json({ success: true, message: 'Event updated successfully' });
    } catch (error: any) {
        if (error.message === 'EVENT_NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        if (error.message === 'CURRENCY_NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Currency not found' });
        }
        if (error.message === 'EVENT_NOT_OWNED_BY_HOST') {
            return res.status(403).json({ success: false, message: 'Forbidden. You do not own this event.' });
        }
        if (error.message === 'INVALID_EVENT_DATA') {
            return res.status(400).json({ success: false, message: 'Invalid event data' });
        }
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const publishEvent = async (req: Request<{ slug: string }>, res: Response<ApiResponse<any>>) => {
    try {
        const { slug } = req.params;
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const hostId = parseUserId(req.user.id);
        if (hostId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }

        await eventService.publishEvent(hostId, slug);

        return res.status(200).json({ success: true, message: 'Event published successfully' });
    } catch (error: any) {
        if (error.message === 'EVENT_NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        if (error.message === 'STRIPE_ACCOUNT_NOT_FOUND') {
            return res.status(400).json({ success: false, message: 'Stripe account not found' });
        }
        if (error.message === 'EVENT_NOT_OWNED_BY_HOST') {
            return res.status(403).json({ success: false, message: 'Forbidden. You do not own this event.' });
        }
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const closeEvent = async (req: Request<{ slug: string }>, res: Response<ApiResponse<any>>) => {
    try {
        const { slug } = req.params;
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const hostId = parseUserId(req.user.id);
        if (hostId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }

        await eventService.closeEvent(hostId, slug);

        return res.status(200).json({ success: true, message: 'Event Closed successfully' });
    } catch (error: any) {
        if (error.message === 'EVENT_NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        if (error.message === 'EVENT_NOT_OWNED_BY_HOST') {
            return res.status(403).json({ success: false, message: 'Forbidden. You do not own this event.' });
        }
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


export const findEventsByHostId = async (req: Request, res: Response<ApiResponse<SearchEventResponse>>) => {
    try {
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const user_id = parseUserId(req.user.id);
        if (user_id === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }
        const { page, limit, status, search } = req.query as unknown as {
            page: number;
            limit: number;
            status?: EventStatus;
            search?: string;
        };

        if (req.user.role !== Role.HOST) {
            return res.status(403).json({ success: false, message: 'Forbidden. Only hosts can access this resource.' });
        }

        const result = await eventService.findEventsByHostId(user_id, page, limit, status, search);
        const { formattedEvents, total, totalPages } = result;
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
        const currencyCode = req.headers['currency'] as string;

        if (!slug || !currencyCode) {
            return res.status(400).json({ success: false, message: 'Missing slug or currency' });
        }
        let userId: number | undefined;
        if (req.user) {
            const parsedUserId = parseUserId(req.user.id);
            if (parsedUserId === null) {
                return res.status(400).json({ success: false, message: 'Invalid user ID.' });
            }
            userId = parsedUserId;
        } else {
            const authHeader = req.headers.authorization;
            if (authHeader?.startsWith('bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const secret = process.env.JWT_SECRET;
                    if (secret) {
                        if (token) {
                            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as User;
                            const parsedUserId = parseUserId(decoded.id);
                            if (parsedUserId !== null) {
                                userId = parsedUserId;
                            }
                        }
                    }
                } catch (e) {
                }
            }
        }

        const eventData = await eventService.getEventDetails(slug, userId, currencyCode);
        return res.status(200).json({
            success: true,
            message: 'Event get successfully',
            data: eventData
        });
    } catch (error: any) {
        if (error.message === 'EVENT_NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        return res.status(500).json({ success: false, message: 'Internal server error' });

    }
};

export const getEventDetailsBySlug = async (
    req: Request,
    res: Response<ApiResponse<any>>
) => {
    try {
        const { slug } = req.params;
        const currencyCode = req.headers['currency'] as string;

        if (!slug || !currencyCode) {
            return res.status(400).json({ success: false, message: 'Invalid request' });
        }
        if (!req.user || req.user.role !== Role.HOST) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const userId = parseUserId(req.user.id);
        if (userId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }
        const eventData = await eventService.getHostEventDetails(
            slug,
            userId,
            currencyCode
        );
        return res.status(200).json({
            success: true,
            message: 'Event details retrieved successfully',
            data: eventData
        });

    } catch (error: any) {
        if (error.message === 'EVENT_NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        if (error.message === 'EVENT_NOT_OWNED_BY_HOST') {
            return res.status(403).json({ success: false, message: 'Forbidden. You do not own this event.' });
        }
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getEventEditBySlug = async (
    req: Request,
    res: Response<ApiResponse<any>>
) => {
    try {
        const { slug } = req.params;
        const currencyCode = req.headers['currency'] as string;

        if (!slug || !currencyCode || !req.user) {
            return res.status(400).json({ success: false, message: 'Invalid request' });
        }

        const userId = parseUserId(req.user.id);
        if (userId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }

        const eventData = await eventService.getHostEditEvent(
            slug,
            userId,
            currencyCode
        );

        return res.status(200).json({
            success: true,
            message: 'Event details retrieved successfully',
            data: eventData
        });

    } catch (error: any) {
        if (error.message === 'EVENT_NOT_FOUND') return res.status(404).json({ success: false, message: 'Event not found' });
        if (error.message === 'EVENT_NOT_OWNED_BY_HOST') return res.status(403).json({ success: false, message: 'Forbidden' });
        if (error.message === 'CURRENCY_NOT_SUPPORTED') return res.status(400).json({ success: false, message: 'Currency not supported' });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const checkoutByUpdateEventReserved = async (
    req: Request<{ eventId: string, boothId: string }>,
    res: Response<ApiResponse<any>>
) => {
    try {
        const { eventId, boothId } = req.body as { eventId: number; boothId: number };
        const currency = (req.headers['currency'] as string || 'USD').toUpperCase();

        if (!req.user) return res.status(404).json({ success: false, message: 'User not found' });

        const userId = parseUserId(req.user.id);
        if (userId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }

        const sessionUrl = await eventService.createBoothCheckoutSession(
            userId,
            req.user.email,
            req.user.username,
            req.user.role,
            eventId,
            boothId,
            currency
        );

        return res.status(200).json({ success: true, message: 'Booth reserved', data: sessionUrl });
    } catch (error: any) {
        if (error.message === 'EVENT_NOT_FOUND') return res.status(404).json({ success: false, message: 'Event not found' });
        if (error.message === 'EVENT_NOT_AVAILABLE') return res.status(400).json({ success: false, message: 'Event is not available for booking.' });
        if (error.message === 'EVENT_EXPIRED') return res.status(400).json({ success: false, message: 'This event has already ended.' });
        if (error.message === 'BOOTH_UNAVAILABLE') return res.status(400).json({ success: false, message: 'Booth is not available' });
        if (error.message === 'HOST_STRIPE_NOT_CONNECTED') return res.status(400).json({ success: false, message: 'This event host has not connected their Stripe account yet.' });
        if (error.message === 'CURRENCY_NOT_SUPPORTED') return res.status(400).json({ success: false, message: 'Currency not supported.' });

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
