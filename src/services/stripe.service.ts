import { prisma } from '../lib/db.js';
import Stripe from 'stripe';
import { authRepository } from '../repository/auth.repository.js';
import { eventRepository } from '../repository/event.repository.js';
import { mailService } from '../services/mail.service.js';
import { PaymentStatus } from '@prisma/client';
import { BoothType } from '../types/types.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-03-25.dahlia',
});

const createStripeConnectAccount = async (userId: number) => {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }

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
    return accountLink.url;
}

const checkStripeStatus = async (userId: number) => {
    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user)
        throw new Error('USER_NOT_FOUND');

    let payoutsEnabled = user.stripe_payout_enabled;
    let hasAccountId = !!user.stripe_account_id;

    if (hasAccountId && !payoutsEnabled) {
        const account = await stripe.accounts.retrieve(user.stripe_account_id!);
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
        } else if (account.payouts_enabled && !payoutsEnabled) {
            await authRepository.updateUserStripeStatus(userId, true);
            payoutsEnabled = true;
        }
    }
    return { hasAccountId, payoutsEnabled, user };

}

const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
    const { bookingId, boothId } = session.metadata!;
    if (!bookingId || !boothId) {
        throw new Error('ERROR');
    }
    const booking = await eventRepository.getBookingById(parseInt(bookingId));

    if (booking?.payment_status === 'PAID') return;

    const sessionWithDetails = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['payment_intent.latest_charge'],
    });

    const paymentIntent = sessionWithDetails.payment_intent as Stripe.PaymentIntent;
    const charge = paymentIntent?.latest_charge as Stripe.Charge;

    const result = await eventRepository.finalizeBoothBooking(parseInt(bookingId), parseInt(boothId), {
        cardBrand: charge?.payment_method_details?.card?.brand ?? '',
        cardLast4: charge?.payment_method_details?.card?.last4 ?? '',
        stripeChargeId: charge?.id,
        receiptUrl: charge?.receipt_url ?? '',
    });

    if (result.confirmationLog) await mailService.attemptSend(result.confirmationLog.id);
    if (result.vendorPaidLog) await mailService.attemptSend(result.vendorPaidLog.id);
}

const handleCapabilityUpdated = async (capability: Stripe.Capability) => {
    const accountId: string = typeof capability.account === 'string'
        ? capability.account
        : capability.account.id;
    if (capability.id === 'transfers') {
        if ((capability.status as string) === 'disabled') {
            await authRepository.disableUserStripePayoutStatus(accountId);
        } else if ((capability.status as string) === 'active') {
            await authRepository.enableUserStripePayoutStatus(accountId);
        }
    }
}

const handleCheckoutExpired = async (session: Stripe.Checkout.Session) => {
    const metadata = session.metadata;
    if (metadata && metadata.bookingId && metadata.boothId) {
        const bookingId = parseInt(metadata.bookingId);
        const boothId = parseInt(metadata.boothId);

        const booking = await eventRepository.getBookingById(bookingId);
        if (booking?.payment_status === PaymentStatus.FAILED) {
            return;
        }

        await eventRepository.confirmBoothBooking(bookingId, PaymentStatus.FAILED);
        await eventRepository.confirmUpdateBoothStatus(boothId, BoothType.AVAILABLE);

    }
}
export const stripeService =
{
    createStripeConnectAccount
    , checkStripeStatus
    , handleCheckoutCompleted,
    handleCapabilityUpdated,
    handleCheckoutExpired
};
