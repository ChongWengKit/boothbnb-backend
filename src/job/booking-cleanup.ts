import cron from 'node-cron';
import Stripe from 'stripe';
import * as eventService from '../services/event.service.js';
import { PaymentStatus } from '@prisma/client';
import { BoothType } from '../types/types.js';
import { sendVendorPaidMail, sendBookingConfirmedMail } from '../services/mail.service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-03-25.dahlia',
});

export async function runBookingCleanup() {

    try {
        const pendingBookings = await eventService.getPendingBookingsWithSessions();

        for (const booking of pendingBookings) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            if (!booking.session_id && booking.booked_at < oneHourAgo) {
                await eventService.confirmBoothBooking(booking.id, PaymentStatus.FAILED);
                await eventService.confirmUpdateBoothStatus(booking.booth_id, BoothType.AVAILABLE);
                continue;
            }
            if (!booking.session_id) continue;
            try {
                const session = await stripe.checkout.sessions.retrieve(booking.session_id, {
                    expand: ['payment_intent.latest_charge'],
                });
                if (session.status === 'complete' || session.payment_status === 'paid') {
                    const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
                    const charge = paymentIntent?.latest_charge as Stripe.Charge;

                    const data = await eventService.confirmBoothBooking(booking.id, PaymentStatus.PAID, {
                        cardBrand: charge?.payment_method_details?.card?.brand ?? '',
                        cardLast4: charge?.payment_method_details?.card?.last4 ?? '',
                        stripeChargeId: charge?.id,
                        receiptUrl: charge?.receipt_url ?? '',
                    });
                    await eventService.confirmUpdateBoothStatus(booking.booth_id, BoothType.SOLD);

                    const bookingData = await eventService.getBookingById(booking.id);
                    const eventData = await eventService.getEventByBoothId(booking.booth_id);
                    
                    if (eventData && eventData.host && bookingData?.vendor) {
                        await sendBookingConfirmedMail(
                            bookingData.vendor.email,
                            bookingData.vendor.username,
                            eventData.title,
                            booking.booth_name ?? "",
                            booking.id,
                            bookingData.vendor_id
                        );

                        await sendVendorPaidMail(
                            eventData.host.id,
                            eventData.host.username,
                            eventData.host.email,
                            bookingData.vendor.username,
                            bookingData.vendor.email,
                            eventData.title,
                            booking.booth_name ?? ""
                        );
                    }
                    
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

                if (session.status === 'expired') {
                 
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