import { PaymentStatus } from '@prisma/client';
import { EventStatus, BoothType } from '../types/types.js';
import { prisma } from '../lib/db.js';
import * as slugify from 'slugify';
export const getEventsBySearchRequest = async (request) => {
    const { title, longitude, latitude, start_date, end_date, category, ne_lat, ne_lng, sw_lat, sw_lng, type, page = 1, limit = 10 } = request;
    const where = {
        status: EventStatus.PUBLISHED,
    };
    let range = 0.05;
    if (type === 'house' || type === 'street') {
        range = 0.02;
    }
    else if (type === 'city' || type === 'town') {
        range = 0.15;
    }
    else if (type === 'country') {
        range = 5.0;
    }
    if (title) {
        where.OR = [
            { title: { contains: title, mode: 'insensitive' } },
        ];
    }
    if (ne_lat && sw_lat && ne_lng && sw_lng) {
        where.latitude = { gte: Number(sw_lat), lte: Number(ne_lat) };
        where.longitude = { gte: Number(sw_lng), lte: Number(ne_lng) };
    }
    else if (longitude && latitude) {
        where.latitude = { gte: latitude - range, lte: latitude + range };
        where.longitude = { gte: longitude - range, lte: longitude + range };
    }
    if (start_date && end_date) {
        const searchStart = new Date(start_date);
        const searchEnd = new Date(end_date);
        where.AND = [
            {
                start_date: {
                    gte: searchStart,
                },
            },
            {
                end_date: {
                    lte: searchEnd,
                },
            },
        ];
    }
    if (category) {
        where.category = category;
    }
    const [events, totalItems] = await Promise.all([
        prisma.events.findMany({
            where,
            take: limit,
            skip: (page - 1) * limit,
            select: {
                id: true,
                title: true,
                address: true,
                start_date: true,
                end_date: true,
                latitude: true,
                longitude: true,
                slug: true,
                images: {
                    take: 1,
                    select: { url: true },
                },
                _count: {
                    select: { booths: true },
                },
                booths: {
                    where: { type: { in: [BoothType.RESERVED, BoothType.SOLD, BoothType.LOCKED] } },
                    select: { id: true, type: true },
                },
            },
            orderBy: {
                id: 'desc',
            },
        }),
        prisma.events.count({ where })
    ]);
    return {
        events: events,
        total: totalItems
    };
};
export const createEvent = async (hostId, data) => {
    const { title, description, address, longitude, latitude, start_date, end_date, category, images, booths } = data;
    const event = await prisma.events.create({
        data: {
            title,
            description,
            address,
            longitude,
            latitude,
            currency_code: data.currency_code,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            category: category,
            host_id: hostId,
            status: EventStatus.DRAFT,
            slug: "default",
            images: {
                create: images?.filter(url => url !== null).map(url => ({ url })) ?? []
            },
            booths: {
                create: booths.map(booth => ({
                    name: booth.name,
                    price: Number(booth.price),
                    type: booth.type,
                    x: booth.x,
                    y: booth.y,
                    width: booth.width,
                    height: booth.height,
                    rotation: booth.rotation,
                    description: booth.description ?? null
                }))
            },
        },
        select: {
            id: true,
            title: true
        }
    });
    const finalSlug = slugify.default(`${event.title}-${event.id}`, { lower: true, strict: true });
    return await prisma.events.update({
        where: { id: event.id },
        data: { slug: finalSlug },
        select: {
            id: true,
            slug: true
        }
    });
};
export const createBoothBooking = async (userId, currency_code, boothId, boothName, eventName, amount) => {
    return await prisma.$transaction([
        prisma.booth_bookings.create({
            data: {
                vendor_id: userId,
                booth_id: boothId,
                amount: amount,
                currency_code: currency_code,
                payment_status: PaymentStatus.PENDING,
                booth_name: boothName,
                event_name: eventName
            },
        }),
        prisma.booths.update({
            where: { id: boothId, type: BoothType.AVAILABLE },
            data: { type: BoothType.RESERVED },
            select: {
                id: true,
                type: true
            }
        })
    ]);
};
export const getPendingBookingsWithSessions = async () => {
    return prisma.booth_bookings.findMany({
        where: {
            payment_status: PaymentStatus.PENDING,
            session_id: { not: null },
        },
    });
};
export const updateBoothBooking = async (id, sessionId) => {
    return prisma.booth_bookings.update({
        where: { id },
        data: { session_id: sessionId }
    });
};
export const getBookingsByUserId = async (userId, page = 1, limit = 20, paymentStatus) => {
    const where = {
        vendor_id: userId,
    };
    if (paymentStatus) {
        where.payment_status = { in: [paymentStatus] };
    }
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
        prisma.booth_bookings.findMany({
            where,
            orderBy: { booked_at: 'desc' },
            skip,
            take: limit,
            include: {
                booth: true
            }
        }),
        prisma.booth_bookings.count({ where })
    ]);
    return { bookings, total };
};
export const getBookingById = async (id) => {
    return prisma.booth_bookings.findUnique({
        where: { id },
        include: {
            booth: {
                include: {
                    event: {
                        include: {
                            booths: true,
                            images: true
                        }
                    }
                }
            },
            vendor: {
                select: {
                    username: true,
                    email: true,
                    profile_photo: true
                }
            }
        }
    });
};
export const confirmBoothBooking = async (bookingId, status, paymentDetails) => {
    return prisma.booth_bookings.update({
        where: { id: bookingId, payment_status: PaymentStatus.PENDING },
        data: {
            payment_status: status,
            ...(paymentDetails && {
                cardBrand: paymentDetails.cardBrand,
                cardLast4: paymentDetails.cardLast4,
                stripeChargeId: paymentDetails.stripeChargeId,
                receiptUrl: paymentDetails.receiptUrl,
            })
        },
    });
};
export const updateEvent = async (id, data) => {
    const { title, currency_code, description, address, longitude, latitude, start_date, end_date, category, images, booths } = data;
    const updateData = {};
    if (description !== undefined) {
        updateData.description = description;
    }
    if (address !== undefined) {
        updateData.address = address;
    }
    if (currency_code) {
        updateData.currency = {
            connect: { currency: currency_code }
        };
    }
    if (longitude !== undefined) {
        updateData.longitude = longitude;
    }
    if (latitude !== undefined) {
        updateData.latitude = latitude;
    }
    if (title) {
        updateData.title = title;
        const finalSlug = slugify.default(`${title}-${id}`, { lower: true, strict: true });
        updateData.slug = finalSlug;
    }
    if (start_date)
        updateData.start_date = new Date(start_date);
    if (end_date)
        updateData.end_date = new Date(end_date);
    if (category)
        updateData.category = category;
    if (images) {
        updateData.images = {
            deleteMany: {},
            create: images.map(url => ({ url }))
        };
    }
    if (booths) {
        updateData.booths = {
            deleteMany: {},
            create: booths.map(booth => ({
                name: booth.name,
                price: Number(booth.price),
                type: booth.type,
                x: booth.x,
                y: booth.y,
                width: booth.width,
                height: booth.height,
                rotation: booth.rotation,
                description: booth.description ?? null
            }))
        };
    }
    return prisma.events.update({
        where: { id },
        data: updateData,
    });
};
export const updateEventStatus = async (id, status) => {
    return prisma.events.update({
        where: { id },
        data: { status: status },
    });
};
export const getEventById = async (id) => {
    return prisma.events.findUnique({
        where: { id, status: EventStatus.PUBLISHED },
        include: {
            booths: true,
            images: {
                take: 1,
                select: { url: true }
            },
        },
    });
};
export const getEventsByHostId = async (hostId, page = 1, limit = 20, status, search) => {
    const skip = (page - 1) * limit;
    const where = {
        host_id: hostId,
    };
    if (status) {
        where.status = status;
    }
    if (search) {
        where.title = { contains: search, mode: 'insensitive' };
    }
    const [events, total] = await Promise.all([
        prisma.events.findMany({
            where,
            select: {
                id: true,
                title: true,
                address: true,
                start_date: true,
                latitude: true,
                longitude: true,
                status: true,
                slug: true,
                end_date: true,
                images: {
                    take: 1,
                    select: { url: true }
                },
                _count: {
                    select: { booths: true }
                },
                booths: {
                    where: { type: { in: [BoothType.RESERVED, BoothType.SOLD, BoothType.LOCKED] } },
                    select: { id: true, type: true }
                }
            },
            orderBy: { id: 'desc' },
            skip,
            take: limit,
        }),
        prisma.events.count({ where })
    ]);
    return { events, total };
};
export const getEventsByIds = async (ids) => {
    return prisma.events.findMany({
        where: {
            id: { in: ids },
        },
        select: {
            id: true,
            title: true,
            address: true,
            start_date: true,
            end_date: true,
            images: {
                take: 1,
                select: { url: true }
            },
            _count: {
                select: { booths: true }
            },
            booths: {
                where: { type: { in: [BoothType.RESERVED, BoothType.SOLD, BoothType.LOCKED] } },
                select: { id: true, type: true }
            }
        }
    });
};
export const getEventBySlug = async (slug, statuses = [EventStatus.PUBLISHED]) => {
    return prisma.events.findFirst({
        where: {
            slug,
            status: { in: statuses }
        },
        select: {
            id: true,
            title: true,
            address: true,
            longitude: true,
            latitude: true,
            start_date: true,
            status: true,
            currency_code: true,
            slug: true,
            end_date: true,
            description: true,
            host_id: true,
            host: {
                select: {
                    username: true,
                    profile_photo: true
                }
            },
            _count: {
                select: {
                    bookmarks: true
                }
            },
            images: {
                select: { url: true }
            },
            booths: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    price: true,
                    x: true,
                    y: true,
                    width: true,
                    height: true,
                    rotation: true
                }
            }
        }
    });
};
export const getEventDetailsBySlug = async (slug) => {
    const event = await prisma.events.findFirst({
        where: {
            slug,
        },
        include: {
            host: {
                select: {
                    id: true,
                    username: true,
                    profile_photo: true
                }
            },
            images: {
                select: { url: true }
            },
            booths: {
                include: {
                    bookings: {
                        include: {
                            vendor: {
                                select: {
                                    id: true,
                                    username: true,
                                    profile_photo: true,
                                    email: true
                                }
                            },
                        }
                    }
                }
            },
            _count: {
                select: {
                    bookmarks: true
                }
            }
        }
    });
    if (!event)
        return null;
    const eventData = event;
    const paidVendors = new Set();
    const reservingVendors = new Set();
    const bookingSummaries = [];
    eventData.booths.forEach((booth) => {
        booth.bookings.forEach((booking) => {
            if (booking.payment_status === PaymentStatus.FAILED)
                return;
            const isPaid = booking.payment_status === PaymentStatus.PAID;
            bookingSummaries.push({
                vendor: booking.vendor,
                booth_name: booth.name,
                price: Number(booking.amount),
                currency_code: booking.currency_code,
                status: isPaid ? 'PAID' : 'RESERVED',
                booked_at: booking.booked_at
            });
            if (isPaid) {
                paidVendors.add(booking.vendor);
            }
            else if (booking.payment_status === PaymentStatus.PENDING) {
                reservingVendors.add(booking.vendor);
            }
        });
    });
    return {
        ...eventData,
        bookmarks_count: eventData._count?.bookmarks || 0,
        paid_vendors: Array.from(paidVendors),
        reserving_vendors: Array.from(reservingVendors),
        booking_summaries: bookingSummaries
    };
};
export const updateBoothStatus = async (boothId, status) => {
    return prisma.booths.update({
        where: { id: boothId, type: BoothType.AVAILABLE },
        data: { type: status },
        select: {
            id: true,
            type: true
        }
    });
};
export const confirmUpdateBoothStatus = async (boothId, status) => {
    return prisma.booths.updateMany({
        where: {
            id: boothId,
            type: BoothType.RESERVED
        },
        data: { type: status },
    });
};
export const getEventByBoothId = async (boothId) => {
    return prisma.events.findFirst({
        where: {
            booths: {
                some: { id: boothId }
            }
        },
        include: {
            host: true,
            booths: {
                where: { id: boothId }
            }
        }
    });
};
//# sourceMappingURL=event.service.js.map