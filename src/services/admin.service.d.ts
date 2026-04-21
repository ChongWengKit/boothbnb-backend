import { ActionType, AdminRequestStatus } from '@prisma/client';
export declare const createAdminRequest: (action_type: ActionType, userId: number) => Promise<{
    id: number;
    created_at: Date;
    updated_at: Date | null;
    user_id: number;
    status: import("@prisma/client").$Enums.AdminRequestStatus;
    action_type: import("@prisma/client").$Enums.ActionType;
}>;
export declare const updateAdminRequest: (id: number, status: AdminRequestStatus) => Promise<{
    id: number;
    created_at: Date;
    updated_at: Date | null;
    user_id: number;
    status: import("@prisma/client").$Enums.AdminRequestStatus;
    action_type: import("@prisma/client").$Enums.ActionType;
}>;
export declare const deleteAdminRequestByUserId: (userId: number) => Promise<import("@prisma/client").Prisma.BatchPayload>;
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
//# sourceMappingURL=admin.service.d.ts.map