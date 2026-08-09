import { Request, Response } from 'express';
import { EmailLogCategory, EmailLogStatus } from '@prisma/client';
import { mailRepository } from '../repository/mail.repository.js';
import { mailService } from '../services/mail.service.js';

export const handleResendWebhook = async (req: Request, res: Response) => {
    try {
        const { type, data } = req.body;
        const emailId = data.email_id;
        let newStatus: EmailLogStatus | null = null;

        await mailService.handleResendWebhook(type, emailId, newStatus);

        return res.status(200).json({ received: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getEmailLogs = async (req: Request, res: Response) => {
    try {
        const { page, limit } = req.query as unknown as { page: number; limit: number };
        const status = req.query.status as EmailLogStatus | undefined;
        const category = req.query.category as EmailLogCategory | undefined;
        const search = req.query.search as string | undefined;
        const logs = await mailRepository.getAllEmailLogs(page, limit, status, category, search);
        return res.status(200).json({
            success: true,
            message: 'Email logs retrieved successfully',
            data: logs.data,
            meta: logs.meta
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const resendEmail = async (req: Request<{ logId: string }>, res: Response) => {
    try {
        const { logId } = req.body as { logId: number };

        await mailService.resentEmail(logId.toString());

        return res.status(200).json({ success: true, message: 'Email resent successfully' });
    } catch (error: any) {
        if (error.message === 'PENDING_EMAIL') return res.status(400).json({ success: false, message: 'Email is still pending' });
        if (error.message === 'INVALID_EMAIL') return res.status(400).json({ success: false, message: 'Email is invalid' });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};