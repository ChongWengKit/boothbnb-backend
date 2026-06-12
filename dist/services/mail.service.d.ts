import pkg, { EmailLogCategory, EmailLogStatus } from '@prisma/client';
export declare const attemptSend: (logId: number) => Promise<{
    id: number;
    user_id: number;
    category: pkg.$Enums.EmailLogCategory;
    status: pkg.$Enums.EmailLogStatus;
    email_id: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue;
    attempts: number;
} | null | undefined>;
export declare const logEmail: (user_id: number, category: EmailLogCategory, payload: Record<string, any>, status?: EmailLogStatus, email_id?: string) => Promise<{
    id: number;
    user_id: number;
    category: pkg.$Enums.EmailLogCategory;
    status: pkg.$Enums.EmailLogStatus;
    email_id: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue;
    attempts: number;
}>;
export declare const updateEmailLogStatus: (emailId: string, newStatus: EmailLogStatus) => Promise<void>;
export declare const syncEmailStatus: (emailId: string) => Promise<void>;
export declare const getEmailLogById: (id: number) => Promise<{
    id: number;
    user_id: number;
    category: pkg.$Enums.EmailLogCategory;
    status: pkg.$Enums.EmailLogStatus;
    email_id: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue;
    attempts: number;
} | null>;
export declare const getAllEmailLogs: (page: number, limit: number, status?: EmailLogStatus, category?: EmailLogCategory, search?: string) => Promise<{
    data: {
        id: number;
        user_id: number;
        category: pkg.$Enums.EmailLogCategory;
        status: pkg.$Enums.EmailLogStatus;
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