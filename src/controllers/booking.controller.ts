import { Request, Response } from 'express';
import { ApiResponse } from '../types/types.js';
import { Role } from '@prisma/client';
import { bookingService } from '../services/booking.service.js';
import { eventRepository } from '../repository/event.repository.js';
import { parsePageLimit, parseUserId, validatePagination } from '../lib/validation.js';
export const getUserBookings = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const userId = parseUserId(req.user.id);
        if (userId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }
        const { page, limit } = parsePageLimit(req.query.page, req.query.limit);
        if (!validatePagination(page, limit)) {
            return res.status(400).json({ success: false, message: 'Invalid pagination parameters.' });
        }
        const result = await bookingService.getUserBookings(userId, page, limit);

        const { bookings, total, totalPages } = result;

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
        
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getUserPaidBookings = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const userId = parseUserId(req.user.id);
        if (userId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }
        const { page, limit } = parsePageLimit(req.query.page, req.query.limit);
        if (!validatePagination(page, limit)) {
            return res.status(400).json({ success: false, message: 'Invalid pagination parameters.' });
        }

        const result = await bookingService.getUserPaidBookings(userId, page, limit);
        const { bookings, total, totalPages } = result;
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
        
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getBookingById = async (req: Request<{ id: string }>, res: Response<ApiResponse<any>>) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (Number.isNaN(bookingId)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID.' });
        }
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const userId = parseUserId(req.user.id);
        if (userId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }

        const booking = await eventRepository.getBookingById(bookingId);

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
