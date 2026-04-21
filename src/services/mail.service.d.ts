import { EmailLogCategory, EmailLogStatus } from "@prisma/client";
export declare const attemptSend: (logId: number) => Promise<{
    id: number;
    user_id: number;
    category: import("@prisma/client").$Enums.EmailLogCategory;
    status: import("@prisma/client").$Enums.EmailLogStatus;
    email_id: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue;
    attempts: number;
} | null>;
export declare const sendVerifyEmail: (email: string, name: string, user_id: number) => Promise<{
    id: number;
    user_id: number;
    category: import("@prisma/client").$Enums.EmailLogCategory;
    status: import("@prisma/client").$Enums.EmailLogStatus;
    email_id: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue;
    attempts: number;
} | null>;
export declare const sendAdminInviteMail: (email: string, name: string, user_id: number) => Promise<{
    id: number;
    user_id: number;
    category: import("@prisma/client").$Enums.EmailLogCategory;
    status: import("@prisma/client").$Enums.EmailLogStatus;
    email_id: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue;
    attempts: number;
} | null>;
export declare const sendResetPasswordMail: (email: string, name: string, user_id: number) => Promise<{
    id: number;
    user_id: number;
    category: import("@prisma/client").$Enums.EmailLogCategory;
    status: import("@prisma/client").$Enums.EmailLogStatus;
    email_id: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue;
    attempts: number;
} | null>;
export declare const sendBookingConfirmedMail: (email: string, name: string, event: string, booth: string, bookingId: number, user_id: number) => Promise<{
    id: number;
    user_id: number;
    category: import("@prisma/client").$Enums.EmailLogCategory;
    status: import("@prisma/client").$Enums.EmailLogStatus;
    email_id: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue;
    attempts: number;
} | null>;
export declare const sendHostApproveMail: (user_id: number, name: string, email: string) => Promise<{
    id: number;
    user_id: number;
    category: import("@prisma/client").$Enums.EmailLogCategory;
    status: import("@prisma/client").$Enums.EmailLogStatus;
    email_id: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue;
    attempts: number;
} | null>;
export declare const logEmail: (user_id: number, category: EmailLogCategory, payload: Record<string, any>, status?: EmailLogStatus, email_id?: string) => Promise<{
    id: number;
    user_id: number;
    category: import("@prisma/client").$Enums.EmailLogCategory;
    status: import("@prisma/client").$Enums.EmailLogStatus;
    email_id: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue;
    attempts: number;
}>;
export declare const updateEmailLogStatus: (emailId: string, newStatus: EmailLogStatus) => Promise<void>;
export declare const syncEmailStatus: (emailId: string) => Promise<void>;
export declare const getEmailLogById: (id: number) => Promise<{
    id: number;
    user_id: number;
    category: import("@prisma/client").$Enums.EmailLogCategory;
    status: import("@prisma/client").$Enums.EmailLogStatus;
    email_id: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue;
    attempts: number;
} | null>;
export declare const getAllEmailLogs: (page: number, limit: number, status?: EmailLogStatus, category?: EmailLogCategory, search?: string) => Promise<{
    data: {
        id: number;
        user_id: number;
        category: import("@prisma/client").$Enums.EmailLogCategory;
        status: import("@prisma/client").$Enums.EmailLogStatus;
        email_id: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue;
        attempts: number;
    }[];
    meta: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}>;
//# sourceMappingURL=mail.service.d.ts.map