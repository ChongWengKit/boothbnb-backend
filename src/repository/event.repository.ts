import { Prisma, PaymentStatus, EmailLogCategory, EmailLogStatus } from '@prisma/client';
import { CreateEventRequest, EventStatus, SearchEventRequest, UpdateEventRequest, BoothType } from '../types/types.js';
import { prisma } from '../lib/db.js';
import * as slugify from 'slugify';

type EventSearchResult = Prisma.eventsGetPayload<{
  select: {
    id: true;
    title: true;
    address: true;
    start_date: true;
    end_date: true;
    latitude: true;
    longitude: true;
    slug: true;
    total_slots: true;
    available_slots: true;
    images: {
      take: 1;
      select: {
        url: true;
      };
    };
  };
}>;

const getEventsBySearchRequest = async (request: SearchEventRequest) => {
  const {
    title,
    longitude,
    latitude,
    start_date,
    end_date,
    category,
    ne_lat,
    ne_lng,
    sw_lat,
    sw_lng,
    type,
    page = 1,
    limit = 10
  } = request;

  const where: Prisma.eventsWhereInput = {
    status: EventStatus.PUBLISHED as any,
  };

  let range = 0.05;

  if (type === 'house' || type === 'street') {
    range = 0.02;
  } else if (type === 'city' || type === 'town') {
    range = 0.15;
  } else if (type === 'country') {
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
    where.category = category as any;
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
        total_slots: true,
        available_slots: true,
        images: {
          take: 1,
          select: { url: true },
        },
      },
      orderBy: {
        id: 'desc',
      },
    }),
    prisma.events.count({ where })
  ]);

  return {
    events: events as unknown as EventSearchResult[],
    total: totalItems
  };
};

const createEvent = async (hostId: number, data: CreateEventRequest) => {
  const { title, description, address, longitude, latitude, start_date, end_date, category, images, booths } = data;

  const totalSlots = booths.length;
  const availableSlots = booths.filter(b => b.type === BoothType.AVAILABLE).length;

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
      category: category as any,
      host_id: hostId,
      status: EventStatus.DRAFT as any,
      slug: "default",
      total_slots: totalSlots,
      available_slots: availableSlots,
      images: {
        create: images?.filter(url => url !== null).map(url => ({ url })) ?? []
      },
      booths: {
        create: booths.map(booth => ({
          name: booth.name,
          price: Number(booth.price),
          type: booth.type as any,
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

  const finalSlug = (slugify as any).default(`${event.title}-${event.id}`, { lower: true, strict: true });
  return await prisma.events.update({
    where: { id: event.id },
    data: { slug: finalSlug },
    select: {
      id: true,
      slug: true
    }
  });
};

const createBoothBooking = async (userId: number, currency_code: string, boothId: number, boothName: string, eventName: string, amount: number) => {
  return await prisma.$transaction(async (tx) => {
    const booth = await tx.booths.findUnique({
      where: { id: boothId },
      select: { event_id: true }
    });

    if (!booth) {
      throw new Error('BOOTH_NOT_FOUND');
    }

    const decrementResult = await tx.events.updateMany({
      where: { id: booth.event_id, available_slots: { gt: 0 } },
      data: { available_slots: { decrement: 1 } }
    });

    if (decrementResult.count === 0) {
      throw new Error('NO_AVAILABLE_SLOTS');
    }

    const booking = await tx.booth_bookings.create({
      data: {
        vendor_id: userId,
        booth_id: boothId,
        amount: amount,
        currency_code: currency_code,
        payment_status: PaymentStatus.PENDING,
        booth_name: boothName,
        event_name: eventName
      },
    });

    await tx.booths.update({
      where: { id: boothId, type: BoothType.AVAILABLE },
      data: { type: BoothType.RESERVED as any },
      select: {
        id: true,
        type: true
      }
    });

    return booking;
  });
};

const getPendingBookingsWithSessions = async () => {
  return prisma.booth_bookings.findMany({
    where: {
      payment_status: PaymentStatus.PENDING,
    },
  });
};

const updateBoothBooking = async (id: number, sessionId: string) => {
  return prisma.booth_bookings.update({
    where: { id },
    data: { session_id: sessionId }
  });
}
const getBookingsByUserId = async (userId: number, page: number = 1, limit: number = 20, paymentStatus?: PaymentStatus) => {
  const where: Prisma.booth_bookingsWhereInput = {
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

const getBookingById = async (id: number) => {
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

const confirmBoothBooking = async (
  bookingId: number,
  status: PaymentStatus,
  paymentDetails?: {
    cardBrand?: string | undefined;
    cardLast4?: string | undefined;
    stripeChargeId?: string | undefined;
    receiptUrl?: string | undefined;
  }
) => {
  return prisma.booth_bookings.update({
    where: { id: bookingId , payment_status: PaymentStatus.PENDING} ,
    data: {
      payment_status: status,
      ...(paymentDetails && {
        cardBrand: paymentDetails.cardBrand as string | null,
        cardLast4: paymentDetails.cardLast4 as string | null,
        stripeChargeId: paymentDetails.stripeChargeId as string | null,
        receiptUrl: paymentDetails.receiptUrl as string | null,
      })
    },
  });
};

const confirmBoothBookingWithStatusUpdate = async (
  bookingId: number,
  boothId: number,
  status: PaymentStatus,
  boothStatus: BoothType,
  paymentDetails?: {
    cardBrand?: string | undefined;
    cardLast4?: string | undefined;
    stripeChargeId?: string | undefined;
    receiptUrl?: string | undefined;
  }
) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booth_bookings.update({
      where: { id: bookingId, payment_status: PaymentStatus.PENDING },
      data: {
        payment_status: status,
        ...(paymentDetails && {
          cardBrand: paymentDetails.cardBrand as string | null,
          cardLast4: paymentDetails.cardLast4 as string | null,
          stripeChargeId: paymentDetails.stripeChargeId as string | null,
          receiptUrl: paymentDetails.receiptUrl as string | null,
        })
      },
    });

    const boothUpdate = await tx.booths.updateMany({
      where: {
        id: boothId,
        type: BoothType.RESERVED
      },
      data: { type: boothStatus as any },
    });

    if (boothStatus === BoothType.AVAILABLE && boothUpdate.count > 0) {
      const booth = await tx.booths.findUnique({
        where: { id: boothId },
        select: { event_id: true }
      });
      if (booth) {
        await tx.events.update({
          where: { id: booth.event_id },
          data: { available_slots: { increment: 1 } }
        });
      }
    }

    return booking;
  });
};

const updateEvent = async (id: number, data: UpdateEventRequest) => {
  const { title, currency_code, description, address, longitude, latitude, start_date, end_date, category, images, booths } = data;

  const updateData: Prisma.eventsUpdateInput = {};

  if (booths) {
    updateData.total_slots = booths.length;
    updateData.available_slots = booths.filter(b => b.type === BoothType.AVAILABLE).length;
  }

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
    const finalSlug = (slugify as any).default(`${title}-${id}`, { lower: true, strict: true });
    updateData.slug = finalSlug;
  }

  if (start_date) updateData.start_date = new Date(start_date);
  if (end_date) updateData.end_date = new Date(end_date);
  if (category) updateData.category = category as any;

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
        type: booth.type as any,
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

const updateEventStatus = async (id: number, status: EventStatus) => {
  return prisma.events.update({
    where: { id },
    data: { status: status as any },
  });
};

const getEventById = async (id: number) => {
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

const getEventsByHostId = async (hostId: number, page: number = 1, limit: number = 20, status?: EventStatus, search?: string) => {
  const skip = (page - 1) * limit;
  const where: Prisma.eventsWhereInput = {
    host_id: hostId,
  };
  if (status) {
    where.status = status as any;
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
        total_slots: true,
        available_slots: true,
        images: {
          take: 1,
          select: { url: true }
        },
      },
      orderBy: { id: 'desc' },
      skip,
      take: limit,
    }),
    prisma.events.count({ where })
  ]);
  return { events, total };
}

const getEventsByIds = async (ids: number[]) => {
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
      total_slots: true,
      available_slots: true,
      images: {
        take: 1,
        select: { url: true }
      },
    }
  });
};

const getEventBySlug = async (slug: string, statuses: EventStatus[] = [EventStatus.PUBLISHED]) => {
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
      total_slots: true,
      available_slots: true,
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

const getEventDetailsBySlug = async (slug: string) => {
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
    } as any
  });

  if (!event) return null;

  const eventData = event as any;

  const paidVendors = new Set();
  const reservingVendors = new Set();
  const bookingSummaries: any[] = [];

  eventData.booths.forEach((booth: any) => {
    booth.bookings.forEach((booking: any) => {
      if (booking.payment_status === PaymentStatus.FAILED) return;

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
      } else if (booking.payment_status === PaymentStatus.PENDING) {
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

const finalizeBoothBooking = async (
  bookingId: number,
  boothId: number,
  paymentDetails?: {
    cardBrand?: string | undefined;
    cardLast4?: string | undefined;
    stripeChargeId?: string | undefined;
    receiptUrl?: string | undefined;
  }
) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booth_bookings.update({
      where: { id: bookingId, payment_status: PaymentStatus.PENDING },
      data: {
        payment_status: PaymentStatus.PAID,
        ...(paymentDetails && {
          cardBrand: paymentDetails.cardBrand as string | null,
          cardLast4: paymentDetails.cardLast4 as string | null,
          stripeChargeId: paymentDetails.stripeChargeId as string | null,
          receiptUrl: paymentDetails.receiptUrl as string | null,
        })
      },
      include: { vendor: true }
    });

    await tx.booths.updateMany({
      where: { id: boothId, type: BoothType.RESERVED },
      data: { type: BoothType.SOLD as any },
    });

    const event = await tx.events.findFirst({
      where: { booths: { some: { id: boothId } } },
      include: { host: true }
    });

    let confirmationLog = null;
    let vendorPaidLog = null;

    if (event?.host && booking.vendor) {
      confirmationLog = await tx.email_logs.create({
        data: {
          user_id: booking.vendor_id,
          category: EmailLogCategory.BOOKING_CONFIRMATION,
          payload: { email: booking.vendor.email, name: booking.vendor.username, event: event.title, booth: booking.booth_name ?? "", bookingId: booking.id },
          status: EmailLogStatus.PENDING,
        },
      });

      vendorPaidLog = await tx.email_logs.create({
        data: {
          user_id: event.host.id,
          category: EmailLogCategory.VENDOR_PAID_NOTIFICATION,
          payload: { name: event.host.username, vendorName: booking.vendor.username, email: event.host.email, vendorEmail: booking.vendor.email, eventName: event.title, boothName: booking.booth_name ?? "" },
          status: EmailLogStatus.PENDING,
        },
      });
    }

    return { confirmationLog, vendorPaidLog };
  });
};

const updateBoothStatus = async (boothId: number, status: BoothType) => {
  return prisma.booths.update({
    where: { id: boothId, type: BoothType.AVAILABLE },
    data: { type: status as any },
    select: {
      id: true,
      type: true
    }
  });
};

const confirmUpdateBoothStatus = async (boothId: number, status: BoothType) => {
  return prisma.$transaction(async (tx) => {
    const boothUpdate = await tx.booths.updateMany({
      where: {
        id: boothId,
        type: BoothType.RESERVED
      },
      data: { type: status as any },
    });

    if (status === BoothType.AVAILABLE && boothUpdate.count > 0) {
      const booth = await tx.booths.findUnique({
        where: { id: boothId },
        select: { event_id: true }
      });
      if (booth) {
        await tx.events.update({
          where: { id: booth.event_id },
          data: { available_slots: { increment: 1 } }
        });
      }
    }

    return boothUpdate;
  });
};

const getEventByBoothId = async (boothId: number) => {
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

export const eventRepository = {
  getEventsBySearchRequest,
  createEvent,
  getEventBySlug,
  getEventByBoothId,
  updateBoothStatus,
  confirmUpdateBoothStatus,
  finalizeBoothBooking,
  getEventById,
  updateEvent,
  updateEventStatus,
  getEventsByHostId,
  getEventDetailsBySlug,
  getEventsByIds,
  createBoothBooking,
  getPendingBookingsWithSessions,
  updateBoothBooking,
  confirmBoothBooking,
  confirmBoothBookingWithStatusUpdate,
  getBookingsByUserId,
  getBookingById
}