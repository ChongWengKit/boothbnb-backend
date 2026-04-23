import cron from 'node-cron';
import Stripe from 'stripe';
import * as eventService from '../services/event.service.js';
import { PaymentStatus } from '@prisma/client';
import { BoothType } from '../types/types.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-03-25.dahlia',
});

export async function runBookingCleanup() {
    const TIMEOUT_MS = 15 * 60 * 1000;
    const now = new Date();

    try {
        const pendingBookings = await eventService.getPendingBookingsWithSessions();

        for (const booking of pendingBookings) {
            if (!booking.session_id) continue;

            try {
                const session = await stripe.checkout.sessions.retrieve(booking.session_id, {
                    expand: ['payment_intent.latest_charge'],
                });
                const bookedAt = new Date(booking.booked_at);
                const isTimedOut = (now.getTime() - bookedAt.getTime()) > TIMEOUT_MS;

                if (session.status === 'complete' || session.payment_status === 'paid') {
                    const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
                    const charge = paymentIntent?.latest_charge as Stripe.Charge;

                    await eventService.confirmBoothBooking(booking.id, PaymentStatus.PAID, {
                        cardBrand: charge?.payment_method_details?.card?.brand ?? '',
                        cardLast4: charge?.payment_method_details?.card?.last4?? '',
                        stripeChargeId: charge?.id,
                        receiptUrl: charge?.receipt_url?? '',
                    });
                    await eventService.confirmUpdateBoothStatus(booking.booth_id, BoothType.SOLD);
                    continue;
                }

                if (session.status === 'expired' || isTimedOut) {
                    if (session.status === 'open') {
                        try {
                            await stripe.checkout.sessions.expire(booking.session_id);
                        }
                        catch (err) {
                            continue;
                        }
                    }

                    await eventService.confirmBoothBooking(booking.id, PaymentStatus.FAILED);
                    await eventService.confirmUpdateBoothStatus(booking.booth_id, BoothType.AVAILABLE);
                }

            } catch (err) {
            }
        }
    } catch (error) {
    }
}

cron.schedule('*/5 * * * *', runBookingCleanup);