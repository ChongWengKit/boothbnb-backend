import cron from 'node-cron';
import Stripe from 'stripe';
import * as eventService from '../services/event.service.js';
import { PaymentStatus } from '@prisma/client';
import { BoothType } from '../types/types.js';
import { attemptSend } from '../services/mail.service.js';
import { confirmBoothBookingWithStatusUpdate } from '../services/event.service.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
});
export async function runBookingCleanup() {
    try {
        const pendingBookings = await eventService.getPendingBookingsWithSessions();
        for (const booking of pendingBookings) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            if (!booking.session_id && booking.booked_at < oneHourAgo) {
                await confirmBoothBookingWithStatusUpdate(booking.id, booking.booth_id, PaymentStatus.FAILED, BoothType.AVAILABLE);
                continue;
            }
            if (!booking.session_id)
                continue;
            try {
                const session = await stripe.checkout.sessions.retrieve(booking.session_id, {
                    expand: ['payment_intent.latest_charge'],
                });
                if (session.status === 'complete' || session.payment_status === 'paid') {
                    const paymentIntent = session.payment_intent;
                    const charge = paymentIntent?.latest_charge;
                    const result = await eventService.finalizeBoothBooking(booking.id, booking.booth_id, {
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
                    continue;
                }
                if (session.status === 'expired') {
                    await confirmBoothBookingWithStatusUpdate(booking.id, booking.booth_id, PaymentStatus.FAILED, BoothType.AVAILABLE);
                }
            }
            catch (err) {
            }
        }
    }
    catch (error) {
    }
}
cron.schedule('*/5 * * * *', runBookingCleanup);
//# sourceMappingURL=booking-cleanup.js.map