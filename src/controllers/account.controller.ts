import { Request, Response } from 'express';
import { ApiResponse, EventStatus, Role } from '../types/types.js';
import * as authService from '../services/auth.service.js';
import * as eventService from '../services/event.service.js';
import { BoothType } from '@prisma/client';
export const getAccount = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const username = req.user.username;
        const user = await authService.findUserByUsername(username);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        let eventsData: any[] = [];
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
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error processing' });
    }
};

export const getPublicAccount = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const username = req.params.username as string;
        if (!username) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const user = await authService.findUserByUsername(username);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        let eventsData: any[] = [];
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
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error processing' });
    }
};

export const updateProfilePhoto = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const { profile_photo } = req.body;
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        if (!profile_photo) {
            return res.status(400).json({ success: false, message: 'Photo URL is required.' });
        }

        const userId = parseInt(req.user.id);
        await authService.updateUserProfilePhoto(userId, profile_photo);
        return res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully.',
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error updating profile photo' });
    }
};
