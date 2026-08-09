import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';

export const verifyResendWebhook = (req: Request, res: Response, next: NextFunction) => {
    const rawBody = req.body as Buffer | undefined;
    const signature = req.headers['svix-signature'] as string | undefined;
    const timestamp = req.headers['svix-timestamp'] as string | undefined;
    const svixId = req.headers['svix-id'] as string | undefined;
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret || !signature || !timestamp || !svixId || !rawBody) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature or missing headers.' });
    }

    try {
        const webhook = new Webhook(webhookSecret);
        webhook.verify(rawBody, {
            'svix-id': svixId,
            'svix-timestamp': timestamp,
            'svix-signature': signature,
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    try {
        req.body = JSON.parse(rawBody.toString('utf8'));
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid webhook payload.' });
    }

    next();
};
