import { EventStatus, Role } from '../types/types.js';
import * as authService from '../services/auth.service.js';
import * as eventService from '../services/event.service.js';
import { BoothType } from '@prisma/client';
export const getAccount = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const username = req.user.username;
        const user = await authService.findUserByUsername(username);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        let eventsData = [];
        let meta;
        if (user.role === Role.HOST) {
            const { events, total } = await eventService.getEventsByHostId(user.id, page, limit);
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
        const accountData = {
            ...user,
            events: eventsData
        };
        return res.status(200).json({
            success: true,
            message: 'Account info retrieved successfully.',
            data: accountData,
            meta
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error processing' });
    }
};
export const getPublicAccount = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const username = req.params.username;
        if (!username) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const user = await authService.findUserByUsername(username);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        let eventsData = [];
        let meta;
        if (user.role === Role.HOST) {
            const { events, total } = await eventService.getEventsByHostId(user.id, page, limit, EventStatus.PUBLISHED);
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
        const accountData = {
            ...user,
            events: eventsData
        };
        return res.status(200).json({
            success: true,
            message: 'Account info retrieved successfully.',
            data: accountData,
            meta: meta
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error processing' });
    }
};
//# sourceMappingURL=account.controller.js.map