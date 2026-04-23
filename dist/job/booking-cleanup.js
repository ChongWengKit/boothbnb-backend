import cron from 'node-cron';
import Stripe from 'stripe';
import * as eventService from '../services/event.service.js';
import { PaymentStatus } from '@prisma/client';
import { BoothType } from '../types/types.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
});
export async function runBookingCleanup() {
    console.log('[Cron Job] Syncing Stripe & Checking Timeouts...');
    const TIMEOUT_MS = 15 * 60 * 1000;
    const now = new Date();
    try {
        const pendingBookings = await eventService.getPendingBookingsWithSessions();
        for (const booking of pendingBookings) {
            if (!booking.session_id)
                continue;
            try {
                const session = await stripe.checkout.sessions.retrieve(booking.session_id, {
                    expand: ['payment_intent.latest_charge'],
                });
                const bookedAt = new Date(booking.booked_at);
                const isTimedOut = (now.getTime() - bookedAt.getTime()) > TIMEOUT_MS;
                if (session.status === 'complete' || session.payment_status === 'paid') {
                    const paymentIntent = session.payment_intent;
                    const charge = paymentIntent?.latest_charge;
                    await eventService.confirmBoothBooking(booking.id, PaymentStatus.PAID, {
                        cardBrand: charge?.payment_method_details?.card?.brand ?? '',
                        cardLast4: charge?.payment_method_details?.card?.last4 ?? '',
                        stripeChargeId: charge?.id,
                        receiptUrl: charge?.receipt_url ?? '',
                    });
                    await eventService.confirmUpdateBoothStatus(booking.booth_id, BoothType.SOLD);
                    console.log(`[Cron] SUCCESS: Booking ${booking.id} PAID.`);
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
                        console.log(`[Cron] Force Expired Stripe Session: ${booking.session_id}`);
                    }
                    await eventService.confirmBoothBooking(booking.id, PaymentStatus.FAILED);
                    await eventService.confirmUpdateBoothStatus(booking.booth_id, BoothType.AVAILABLE);
                }
            }
            catch (err) {
                console.error(`[Cron] Error processing booking ${booking.id}:`, err.message);
            }
        }
    }
    catch (error) {
        console.error('[Cron Job] General error:', error);
    }
}
cron.schedule('*/5 * * * *', runBookingCleanup);
//# sourceMappingURL=booking-cleanup.js.map