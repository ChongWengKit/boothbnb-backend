import { Request, Response } from 'express';
import { ApiResponse, EventStatus, Role } from '../types/types.js';
import { accountService } from '../services/account.service.js';
import { eventService } from '../services/event.service.js';
export const getAccount = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const username = req.params.username as string;
        const result = await eventService.getUserEvents(username, page, limit);
        const accountData = {
            ...result.user,
            events: result.eventsData
        };

        return res.status(200).json({
            success: true,
            message: 'Account info retrieved successfully.',
            data: accountData,
            meta: result.meta
        });
    } catch (error: any) {
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        return res.status(500).json({ success: false, message: 'Internal server error processing' });
    }
};

export const getPublicAccount = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const username = req.params.username as string;
        const result = await eventService.getUserEvents(username, page, limit);
        const accountData = {
            ...result.user,
            events: result.eventsData
        };

        return res.status(200).json({
            success: true,
            message: 'Account info retrieved successfully.',
            data: accountData,
            meta: result.meta
        });
    } catch (error: any) {
        if(error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
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
        await accountService.updateProfilePhoto(userId, profile_photo);
        return res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully.',
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error updating profile photo' });
    }
};
