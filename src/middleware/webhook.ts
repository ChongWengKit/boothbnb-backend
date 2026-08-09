import { Request, Response, NextFunction } from 'express';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const verifyResendWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = ((req as any).rawBody as Buffer).toString();

        const result = resend.webhooks.verify({
            payload,
            headers: {
                id: (req.headers['svix-id'] ?? '') as string,
                timestamp: (req.headers['svix-timestamp'] ?? '') as string,
                signature: (req.headers['svix-signature'] ?? '') as string,
            },
            webhookSecret: (process.env.RESEND_WEBHOOK_SECRET ?? '') as string,
        });

        req.body = result;
        next();
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }
};