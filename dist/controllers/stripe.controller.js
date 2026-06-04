import Stripe from 'stripe';
import { prisma } from '../lib/db.js';
import { updateUserStripeStatus } from '../services/auth.service.js';
import * as eventService from '../services/event.service.js';
import * as authServices from '../services/auth.service.js';
import { BoothType } from '../types/types.js';
import { PaymentStatus } from '@prisma/client';
import { attemptSend } from '../services/mail.service.js';
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
        let hasAccountId = !!user.stripe_account_id;
        if (hasAccountId && !payoutsEnabled) {
            const account = await stripe.accounts.retrieve(user.stripe_account_id);
            if (!account.details_submitted) {
                await prisma.users.update({
                    where: { id: userId },
                    data: {
                        stripe_account_id: null,
                        stripe_payout_enabled: false
                    }
                });
                hasAccountId = false;
                payoutsEnabled = false;
                user.stripe_account_id = null;
            }
            else if (account.payouts_enabled && !payoutsEnabled) {
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
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const metadata = session.metadata;
            if (metadata && metadata.bookingId && metadata.boothId) {
                const bookingId = parseInt(metadata.bookingId);
                const boothId = parseInt(metadata.boothId);
                const booking = await eventService.getBookingById(bookingId);
                if (booking?.payment_status === PaymentStatus.PAID) {
                    return res.status(200).json({ received: true });
                }
                const sessionWithDetails = await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['payment_intent.latest_charge'],
                });
                const paymentIntent = sessionWithDetails.payment_intent;
                const charge = paymentIntent?.latest_charge;
                const result = await eventService.finalizeBoothBooking(bookingId, boothId, {
                    cardBrand: charge?.payment_method_details?.card?.brand ?? '',
                    cardLast4: charge?.payment_method_details?.card?.last4 ?? '',
                    stripeChargeId: charge?.id,
                    receiptUrl: charge?.receipt_url ?? '',
                });
                if (result.confirmationLog) {
                    await attemptSend(result.confirmationLog.id);
                }
                if (result.vendorPaidLog) {
                    await attemptSend(result.vendorPaidLog.id);
                }
            }
        }
        else if (event.type === 'checkout.session.expired') {
            const session = event.data.object;
            const metadata = session.metadata;
            if (metadata && metadata.bookingId && metadata.boothId) {
                const bookingId = parseInt(metadata.bookingId);
                const boothId = parseInt(metadata.boothId);
                const booking = await eventService.getBookingById(bookingId);
                if (booking?.payment_status === PaymentStatus.FAILED) {
                    return res.status(200).json({ received: true });
                }
                await eventService.confirmBoothBooking(bookingId, PaymentStatus.FAILED);
                await eventService.confirmUpdateBoothStatus(boothId, BoothType.AVAILABLE);
            }
        }
        else if (event.type === 'capability.updated') {
            const capability = event.data.object;
            const accountId = typeof capability.account === 'string'
                ? capability.account
                : capability.account.id;
            if (capability.id === 'transfers') {
                if (capability.status === 'disabled') {
                    await authServices.disableUserStripePayoutStatus(accountId);
                }
                else if (capability.status === 'active') {
                    await authServices.enableUserStripePayoutStatus(accountId);
                }
            }
        }
        return res.status(200).json({ received: true });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error processing webhook' });
    }
};
//# sourceMappingURL=stripe.controller.js.map