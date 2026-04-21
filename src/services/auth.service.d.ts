import { Prisma } from '@prisma/client';
export declare const findUserByEmail: (email: string) => Promise<{
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
} | null>;
export declare const findUserByUsername: (username: string) => Promise<{
    id: number;
    email: string;
    username: string;
    created_at: Date;
    role: import("@prisma/client").$Enums.Role;
    profile_photo: string | null;
} | null>;
export declare const createUser: (data: Prisma.usersCreateInput) => Promise<{
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
}>;
export declare const findUserById: (id: number) => Promise<{
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
} | null>;
export declare const verifyUser: (userId: number) => Promise<{
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
}>;
export declare const deleteUser: (id: number) => Promise<{
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
}>;
export declare const updateUserPassword: (userId: number, password: string, salt: string) => Promise<{
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
}>;
export declare const createVerifyToken: (data: Prisma.verify_tokensCreateInput) => Promise<{
    id: number;
    created_at: Date;
    token: string;
    expires_in: Date;
    user_id: number;
}>;
export declare const getVerifyTokenByToken: (token: string) => Promise<{
    id: number;
    created_at: Date;
    token: string;
    expires_in: Date;
    user_id: number;
} | null>;
export declare const deleteVerifyTokenByToken: (token: string) => Promise<{
    id: number;
    created_at: Date;
    token: string;
    expires_in: Date;
    user_id: number;
}>;
export declare const createResetToken: (data: Prisma.reset_tokensCreateInput) => Promise<{
    id: number;
    created_at: Date;
    token: string;
    expires_in: Date;
    user_id: number;
}>;
export declare const getResetTokenByToken: (token: string) => Promise<{
    id: number;
    created_at: Date;
    token: string;
    expires_in: Date;
    user_id: number;
} | null>;
export declare const deleteResetTokenByToken: (token: string) => Promise<{
    id: number;
    created_at: Date;
    token: string;
    expires_in: Date;
    user_id: number;
}>;
export declare const getAdminTokenByToken: (token: string) => Promise<{
    id: number;
    email: string;
    created_at: Date;
    token: string;
    expires_in: Date;
} | null>;
export declare const createAdminToken: (email: string, token: string, expires_in: Date) => Promise<{
    id: number;
    email: string;
    created_at: Date;
    token: string;
    expires_in: Date;
}>;
export declare const deleteAdminTokenByToken: (token: string) => Promise<{
    id: number;
    email: string;
    created_at: Date;
    token: string;
    expires_in: Date;
}>;
export declare const deleteAdminTokensByEmail: (email: string) => Promise<Prisma.BatchPayload>;
export declare const finalizeUserRegistration: (userId: number, data: {
    username: string;
    password?: string;
    salt?: string;
    is_verified: boolean;
}) => Promise<{
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
}>;
export declare const findResetTokenByUserId: (user_id: number) => Promise<{
    id: number;
    created_at: Date;
    token: string;
    expires_in: Date;
    user_id: number;
} | null>;
export declare const updateUserStripeStatus: (user_id: number, charges_enabled: boolean) => Promise<{
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
}>;
//# sourceMappingURL=auth.service.d.ts.map