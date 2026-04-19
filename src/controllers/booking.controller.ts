import { Request, Response } from 'express';
import { ApiResponse } from '../types/types.js';
import * as eventService from '../services/event.service.js';
import { PaymentStatus } from '@prisma/client';
import { Role } from '@prisma/client';

export const getUserBookings = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        console.log(req.user)
        const userId = parseInt(req.user.id);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const { bookings, total } = await eventService.getBookingsByUserId(userId, page, limit);
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            message: 'Bookings retrieved successfully.',
            data: bookings,
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
        console.log(error)
            return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getUserPaidBookings = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        console.log(req.user)
        const userId = parseInt(req.user.id);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const { bookings, total } = await eventService.getBookingsByUserId(userId, page, limit, PaymentStatus.PAID);
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            message: 'Bookings retrieved successfully.',
            data: bookings,
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
        console.log(error)
            return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getBookingById = async (req: Request<{ id: string }>, res: Response<ApiResponse<any>>) => {
    try {
        const bookingId = parseInt(req.params.id);
        const userId = parseInt(req.user.id);

        const booking = await eventService.getBookingById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.vendor_id !== userId && req.user.role !== Role.ADMIN) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        return res.status(200).json({
            success: true,
            message: 'Booking details retrieved successfully',
            data: booking
        });
    } catch (error) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
