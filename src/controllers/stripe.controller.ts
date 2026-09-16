import { Request, Response } from 'express';
import Stripe from 'stripe';
import { parseUserId } from '../lib/validation.js';
import { stripeService } from '../services/stripe.service.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-03-25.dahlia',
});

export const createStripeConnectAccount = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const userId = parseUserId(req.user.id);
        if (userId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }
        const accountLinkUrl = await stripeService.createStripeConnectAccount(userId);
        return res.status(200).json({ success: true, url: accountLinkUrl });
    } catch (error: any) {
        if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ success: false, message: 'User not found.' });
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


export const checkStripeStatus = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const userId = parseUserId(req.user.id);
        if (userId === null) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }
        const result = await stripeService.checkStripeStatus(userId);
        const { hasAccountId, payoutsEnabled, user } = result;
        return res.json({ hasAccountId, payoutsEnabled, accountId: user.stripe_account_id });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const payload = (req as any).rawBody as Buffer;
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !endpointSecret) {
        return res.status(400).json({ success: false, message: 'Webhook signature or secret missing.' });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

    } catch (err) {
        return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }
    try {
        if (event.type === 'checkout.session.completed') {
            await stripeService.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        }
        else if (event.type === 'checkout.session.expired') {
            await stripeService.handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        }
        else if (event.type === 'capability.updated') {
            await stripeService.handleCapabilityUpdated(event.data.object);
        }
        return res.status(200).json({ received: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error processing webhook' });
    }
};