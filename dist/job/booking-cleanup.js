import cron from 'node-cron';
import Stripe from 'stripe';
import * as eventService from '../services/event.service.js';
import { PaymentStatus } from '@prisma/client';
import { BoothType } from '../types/types.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
});
export async function runBookingCleanup() {
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
                    /*
                    if (hostStripeAccount && paymentIntent && !paymentIntent.transfer_group) {
                        
                    
                        const amount = event.booths.find(booth => booth.id === booking.booth_id)?.price;
                        console.log(amount)
                        if (amount) {
                            try {
                                const transferAmount = Math.round(Number(amount));
                                const process = await stripe.transfers.create({
                                    amount: transferAmount,
                                    currency: event.currency_code,
                                    destination: hostStripeAccount,
                                    transfer_group: `booking_${booking.id}`,
                                });
                            } catch (transferError) {
                                if ((transferError as any).code === 'balance_insufficient') {
                                    const balance = await stripe.balance.retrieve();
                                }
                            }
                        }
                    }
                    */
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