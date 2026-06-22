import { eventRepository } from "../repository/event.repository.js";
import { PaymentStatus } from "@prisma/client";
const getUserBookings = async (userId: number, page: number, limit: number) => {
    const { bookings, total } = await eventRepository.getBookingsByUserId(userId, page, limit);
    const totalPages = Math.ceil(total / limit);

    return { bookings, total, totalPages };
}

const getUserPaidBookings = async (userId: number, page: number, limit: number) => {
    const { bookings, total } = await eventRepository.getBookingsByUserId(userId, page, limit, PaymentStatus.PAID);
    const totalPages = Math.ceil(total / limit);

    return { bookings, total, totalPages };
}
export const bookingService =
{
    getUserBookings,
    getUserPaidBookings
}