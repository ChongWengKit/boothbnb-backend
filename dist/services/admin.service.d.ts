import { ActionType, AdminRequestStatus, Prisma } from '@prisma/client';
import { EmailLogCategory } from '@prisma/client';
import { EmailLogStatus } from '@prisma/client';
export declare const createAdminRequest: (action_type: ActionType, userId: number) => Promise<{
    id: number;
    created_at: Date;
    updated_at: Date | null;
    user_id: number;
    status: import("@prisma/client").$Enums.AdminRequestStatus;
    action_type: import("@prisma/client").$Enums.ActionType;
}>;
export declare const findAdminRequestById: (id: number) => Promise<{
    id: number;
    created_at: Date;
    updated_at: Date | null;
    user_id: number;
    status: import("@prisma/client").$Enums.AdminRequestStatus;
    action_type: import("@prisma/client").$Enums.ActionType;
} | null>;
export declare const updateAdminRequest: (id: number, status: AdminRequestStatus) => Promise<{
    id: number;
    created_at: Date;
    updated_at: Date | null;
    user_id: number;
    status: import("@prisma/client").$Enums.AdminRequestStatus;
    action_type: import("@prisma/client").$Enums.ActionType;
}>;
export declare const deleteAdminRequestByUserId: (userId: number) => Promise<Prisma.BatchPayload>;
export declare const getAdminRequests: (page?: number, limit?: number, action_type?: ActionType, search?: string, status?: AdminRequestStatus) => Promise<{
    data: {
        user: {
            id: number;
            username: string;
            email: string;
        };
        id: number;
        created_at: Date;
        updated_at: Date | null;
        user_id: number;
        status: import("@prisma/client").$Enums.AdminRequestStatus;
        action_type: import("@prisma/client").$Enums.ActionType;
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
export declare const createUserAndLogEmail: (data: Prisma.usersCreateInput, category: EmailLogCategory, payload: Record<string, any>, status?: EmailLogStatus, email_id?: string) => Promise<{
    user: {
        id: number;
        email: string;
        username: string;
        password: string | null;
        salt: string | null;
        is_verified: boolean;
        created_at: Date;
        updated_at: Date;
        role: import("@prisma/client").$Enums.Role;
        stripe_account_id: string | null;
        stripe_payout_enabled: boolean;
        profile_photo: string | null;
    };
    log: {
        id: number;
        user_id: number;
        category: import("@prisma/client").$Enums.EmailLogCategory;
        status: import("@prisma/client").$Enums.EmailLogStatus;
        email_id: string | null;
        payload: Prisma.JsonValue;
        attempts: number;
    };
}>;
export declare const approveAdminRequestAndVerifyUser: (requestId: number, userId: number, status: AdminRequestStatus, emailCategory: EmailLogCategory, emailPayload: Record<string, any>) => Promise<{
    log: {
        id: number;
        user_id: number;
        category: import("@prisma/client").$Enums.EmailLogCategory;
        status: import("@prisma/client").$Enums.EmailLogStatus;
        email_id: string | null;
        payload: Prisma.JsonValue;
        attempts: number;
    };
}>;
export declare const deleteUserAndAdminRequests: (userId: number) => Promise<[Prisma.BatchPayload, {
    id: number;
    email: string;
    username: string;
    password: string | null;
    salt: string | null;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
    role: import("@prisma/client").$Enums.Role;
    stripe_account_id: string | null;
    stripe_payout_enabled: boolean;
    profile_photo: string | null;
}]>;
//# sourceMappingURL=admin.service.d.ts.map