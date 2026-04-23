import Stripe from 'stripe';
import { prisma } from '../lib/db.js';
import { updateUserStripeStatus } from '../services/auth.service.js';
import * as eventService from '../services/event.service.js';
import * as emailService from '../services/mail.service.js';
import { BoothType } from '../types/types.js';
import { PaymentStatus } from '@prisma/client';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
});
export const createStripeConnectAccount = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const userId = parseInt(req.user.id);
        const user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });
        let stripeAccountId = user.stripe_account_id;
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: 'standard',
                country: 'MY',
                email: user.email,
                capabilities: {
                    transfers: { requested: true },
                    card_payments: { requested: true },
                },
                business_type: 'individual'
            });
            stripeAccountId = account.id;
            await prisma.users.update({
                where: { id: userId },
                data: { stripe_account_id: stripeAccountId }
            });
        }
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${process.env.FRONTEND_DOMAIN}/stripe-connect?error=refresh`,
            return_url: `${process.env.FRONTEND_DOMAIN}/stripe-connect`,
            type: 'account_onboarding'
        });
        return res.status(200).json({ success: true, url: accountLink.url });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const checkStripeStatus = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const userId = parseInt(req.user.id);
        const user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });
        let payoutsEnabled = user.stripe_payout_enabled;
        const hasAccountId = !!user.stripe_account_id;
        if (hasAccountId && !payoutsEnabled) {
            const account = await stripe.accounts.retrieve(user.stripe_account_id);
            if (account.payouts_enabled) {
                await updateUserStripeStatus(userId, true);
                payoutsEnabled = true;
            }
        }
        return res.json({ hasAccountId, payoutsEnabled, accountId: user.stripe_account_id });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const handleStripeWebhook = async (req, res) => {
    console.log("IN");
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !endpointSecret) {
        return res.status(400).json({ success: false, message: 'Webhook signature or secret missing.' });
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
    catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const metadata = session.metadata;
            if (metadata && metadata.bookingId && metadata.boothId) {
                const bookingId = parseInt(metadata.bookingId);
                const boothId = parseInt(metadata.boothId);
                const sessionWithDetails = await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['payment_intent.latest_charge'],
                });
                const paymentIntent = sessionWithDetails.payment_intent;
                const charge = paymentIntent?.latest_charge;
                await eventService.confirmUpdateBoothStatus(boothId, BoothType.SOLD);
                await eventService.confirmBoothBooking(bookingId, PaymentStatus.PAID, {
                    cardBrand: charge?.payment_method_details?.card?.brand ?? '',
                    cardLast4: charge?.payment_method_details?.card?.last4 ?? '',
                    stripeChargeId: charge?.id,
                    receiptUrl: charge?.receipt_url ?? '',
                });
                if (metadata.userEmail && metadata.userName && metadata.eventTitle && metadata.boothName && metadata.bookingId && metadata.userId) {
                    const userEmail = metadata.userEmail;
                    const userName = metadata.userName;
                    const eventTitle = metadata.eventTitle;
                    const boothName = metadata.boothName;
                    const bookingId = parseInt(metadata.bookingId);
                    const userId = parseInt(metadata.userId);
                    await emailService.sendBookingConfirmedMail(userEmail, userName, eventTitle, boothName, bookingId, userId);
                }
                console.log(`[Stripe Webhook] Payment confirmed for Booking ID: ${bookingId}`);
            }
        }
        else if (event.type === 'checkout.session.expired') {
            const session = event.data.object;
            const metadata = session.metadata;
            if (metadata && metadata.bookingId && metadata.boothId) {
                const bookingId = parseInt(metadata.bookingId);
                const boothId = parseInt(metadata.boothId);
                await eventService.confirmBoothBooking(bookingId, PaymentStatus.FAILED);
                await eventService.confirmUpdateBoothStatus(boothId, BoothType.AVAILABLE);
            }
        }
        return res.status(200).json({ received: true });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error processing webhook' });
    }
};
//# sourceMappingURL=stripe.controller.js.map