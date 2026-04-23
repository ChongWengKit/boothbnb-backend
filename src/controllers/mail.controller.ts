import { Request, Response } from 'express';
import { prisma } from '../lib/db.js';
import { EmailLogCategory, EmailLogStatus } from '@prisma/client';
import { updateEmailLogStatus } from '../services/mail.service.js';
import { getEmailLogById, attemptSend, getAllEmailLogs } from '../services/mail.service.js';
import { Category } from '@prisma/client';
import {sendVerifyEmail, sendResetPasswordMail, sendBookingConfirmedMail, sendHostApproveMail} from '../services/mail.service.js';
export const handleResendWebhook = async (req: Request, res: Response) => {
    try {
        const { type, data } = req.body;

        if (!data || !data.email_id) {
            return res.status(400).json({ success: false, message: 'Invalid payload: email_id is missing' });
        }

        const emailId = data.email_id;
        let newStatus: EmailLogStatus | null = null;

        if (type === 'email.sent' || type === 'email.delivered') {
            newStatus = EmailLogStatus.SUCCESSFUL;
        } else if (type === 'email.bounced') {
            newStatus = EmailLogStatus.BOUNCED;
        } else if (type === 'email.complained') {
            newStatus = EmailLogStatus.COMPLAINED;
        }

        if (newStatus) {
            await updateEmailLogStatus(emailId, newStatus);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getEmailLogs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as EmailLogStatus | undefined;
        const category = req.query.category as EmailLogCategory | undefined;
        const search = req.query.search as string | undefined;
        const logs = await getAllEmailLogs(page, limit, status, category, search);
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
        const { logId } = req.body;
        if (!logId) {
            return res.status(400).json({ success: false, message: 'Invalid payload: logId is missing' });
        }

        const emailLog = await getEmailLogById(parseInt(logId))
        if(emailLog){
            await attemptSend(emailLog.id);
        }

        return res.status(200).json({ success: true, message: 'Email resent successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
