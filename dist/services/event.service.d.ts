import { Prisma, PaymentStatus } from '@prisma/client';
import { CreateEventRequest, EventStatus, SearchEventRequest, UpdateEventRequest, BoothType } from '../types/types.js';
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
        images: {
            take: 1;
            select: {
                url: true;
            };
        };
        _count: {
            select: {
                booths: true;
            };
        };
        booths: {
            select: {
                id: true;
                type: true;
            };
        };
    };
}>;
export declare const getEventsBySearchRequest: (request: SearchEventRequest) => Promise<{
    events: EventSearchResult[];
    total: number;
}>;
export declare const createEvent: (hostId: number, data: CreateEventRequest) => Promise<{
    id: number;
    slug: string;
}>;
export declare const createBoothBooking: (userId: number, boothId: number, boothName: string, eventName: string, amount: number) => Promise<{
    id: number;
    amount: Prisma.Decimal;
    payment_status: import("@prisma/client").$Enums.PaymentStatus;
    booked_at: Date;
    session_id: string | null;
    booth_name: string | null;
    event_name: string | null;
    cardBrand: string | null;
    cardLast4: string | null;
    stripeChargeId: string | null;
    receiptUrl: string | null;
    booth_id: number;
    vendor_id: number;
}>;
export declare const getPendingBookingsWithSessions: () => Promise<{
    id: number;
    amount: Prisma.Decimal;
    payment_status: import("@prisma/client").$Enums.PaymentStatus;
    booked_at: Date;
    session_id: string | null;
    booth_name: string | null;
    event_name: string | null;
    cardBrand: string | null;
    cardLast4: string | null;
    stripeChargeId: string | null;
    receiptUrl: string | null;
    booth_id: number;
    vendor_id: number;
}[]>;
export declare const updateBoothBooking: (id: number, sessionId: string) => Promise<{
    id: number;
    amount: Prisma.Decimal;
    payment_status: import("@prisma/client").$Enums.PaymentStatus;
    booked_at: Date;
    session_id: string | null;
    booth_name: string | null;
    event_name: string | null;
    cardBrand: string | null;
    cardLast4: string | null;
    stripeChargeId: string | null;
    receiptUrl: string | null;
    booth_id: number;
    vendor_id: number;
}>;
export declare const getBookingsByUserId: (userId: number, page?: number, limit?: number, paymentStatus?: PaymentStatus) => Promise<{
    bookings: ({
        booth: {
            id: number;
            name: string;
            description: string | null;
            event_id: number;
            width: number;
            type: import("@prisma/client").$Enums.BoothType;
            y: number;
            x: number;
            height: number;
            rotation: number;
            price: Prisma.Decimal;
        };
    } & {
        id: number;
        amount: Prisma.Decimal;
        payment_status: import("@prisma/client").$Enums.PaymentStatus;
        booked_at: Date;
        session_id: string | null;
        booth_name: string | null;
        event_name: string | null;
        cardBrand: string | null;
        cardLast4: string | null;
        stripeChargeId: string | null;
        receiptUrl: string | null;
        booth_id: number;
        vendor_id: number;
    })[];
    total: number;
}>;
export declare const getBookingById: (id: number) => Promise<({
    booth: {
        event: {
            booths: {
                id: number;
                name: string;
                description: string | null;
                event_id: number;
                width: number;
                type: import("@prisma/client").$Enums.BoothType;
                y: number;
                x: number;
                height: number;
                rotation: number;
                price: Prisma.Decimal;
            }[];
            images: {
                id: number;
                event_id: number;
                url: string;
            }[];
        } & {
            id: number;
            category: import("@prisma/client").$Enums.Category;
            title: string;
            description: string;
            address: string;
            start_date: Date;
            end_date: Date;
            status: import("@prisma/client").$Enums.EventStatus;
            latitude: number;
            longitude: number;
            slug: string;
            host_id: number;
        };
    } & {
        id: number;
        name: string;
        description: string | null;
        event_id: number;
        width: number;
        type: import("@prisma/client").$Enums.BoothType;
        y: number;
        x: number;
        height: number;
        rotation: number;
        price: Prisma.Decimal;
    };
    vendor: {
        email: string;
        username: string;
        profile_photo: string | null;
    };
} & {
    id: number;
    amount: Prisma.Decimal;
    payment_status: import("@prisma/client").$Enums.PaymentStatus;
    booked_at: Date;
    session_id: string | null;
    booth_name: string | null;
    event_name: string | null;
    cardBrand: string | null;
    cardLast4: string | null;
    stripeChargeId: string | null;
    receiptUrl: string | null;
    booth_id: number;
    vendor_id: number;
}) | null>;
export declare const confirmBoothBooking: (bookingId: number, status: PaymentStatus, paymentDetails?: {
    cardBrand?: string | undefined;
    cardLast4?: string | undefined;
    stripeChargeId?: string | undefined;
    receiptUrl?: string | undefined;
}) => Promise<{
    id: number;
    amount: Prisma.Decimal;
    payment_status: import("@prisma/client").$Enums.PaymentStatus;
    booked_at: Date;
    session_id: string | null;
    booth_name: string | null;
    event_name: string | null;
    cardBrand: string | null;
    cardLast4: string | null;
    stripeChargeId: string | null;
    receiptUrl: string | null;
    booth_id: number;
    vendor_id: number;
}>;
export declare const updateEvent: (id: number, data: UpdateEventRequest) => Promise<{
    id: number;
    category: import("@prisma/client").$Enums.Category;
    title: string;
    description: string;
    address: string;
    start_date: Date;
    end_date: Date;
    status: import("@prisma/client").$Enums.EventStatus;
    latitude: number;
    longitude: number;
    slug: string;
    host_id: number;
}>;
export declare const updateEventStatus: (id: number, status: EventStatus) => Promise<{
    id: number;
    category: import("@prisma/client").$Enums.Category;
    title: string;
    description: string;
    address: string;
    start_date: Date;
    end_date: Date;
    status: import("@prisma/client").$Enums.EventStatus;
    latitude: number;
    longitude: number;
    slug: string;
    host_id: number;
}>;
export declare const getEventById: (id: number) => Promise<({
    booths: {
        id: number;
        name: string;
        description: string | null;
        event_id: number;
        width: number;
        type: import("@prisma/client").$Enums.BoothType;
        y: number;
        x: number;
        height: number;
        rotation: number;
        price: Prisma.Decimal;
    }[];
    images: {
        url: string;
    }[];
} & {
    id: number;
    category: import("@prisma/client").$Enums.Category;
    title: string;
    description: string;
    address: string;
    start_date: Date;
    end_date: Date;
    status: import("@prisma/client").$Enums.EventStatus;
    latitude: number;
    longitude: number;
    slug: string;
    host_id: number;
}) | null>;
export declare const getEventsByHostId: (hostId: number, page?: number, limit?: number, status?: EventStatus, search?: string) => Promise<{
    events: {
        id: number;
        _count: {
            booths: number;
        };
        title: string;
        address: string;
        start_date: Date;
        end_date: Date;
        status: import("@prisma/client").$Enums.EventStatus;
        latitude: number;
        longitude: number;
        slug: string;
        booths: {
            id: number;
            type: import("@prisma/client").$Enums.BoothType;
        }[];
        images: {
            url: string;
        }[];
    }[];
    total: number;
}>;
export declare const getEventsByIds: (ids: number[]) => Promise<{
    id: number;
    _count: {
        booths: number;
    };
    title: string;
    address: string;
    start_date: Date;
    end_date: Date;
    booths: {
        id: number;
        type: import("@prisma/client").$Enums.BoothType;
    }[];
    images: {
        url: string;
    }[];
}[]>;
export declare const getEventBySlug: (slug: string, statuses?: EventStatus[]) => Promise<{
    id: number;
    _count: {
        bookmarks: number;
    };
    title: string;
    description: string;
    address: string;
    start_date: Date;
    end_date: Date;
    status: import("@prisma/client").$Enums.EventStatus;
    latitude: number;
    longitude: number;
    slug: string;
    booths: {
        id: number;
        name: string;
        description: string | null;
        width: number;
        type: import("@prisma/client").$Enums.BoothType;
        y: number;
        x: number;
        height: number;
        rotation: number;
        price: Prisma.Decimal;
    }[];
    images: {
        url: string;
    }[];
    host_id: number;
    host: {
        username: string;
        profile_photo: string | null;
    };
} | null>;
export declare const getEventDetailsBySlug: (slug: string) => Promise<any>;
export declare const updateBoothStatus: (boothId: number, status: BoothType) => Promise<{
    id: number;
    type: import("@prisma/client").$Enums.BoothType;
}>;
export declare const confirmUpdateBoothStatus: (boothId: number, status: BoothType) => Promise<Prisma.BatchPayload>;
export {};
//# sourceMappingURL=event.service.d.ts.map