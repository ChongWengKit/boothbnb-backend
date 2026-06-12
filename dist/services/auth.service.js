import { ActionType, Role, EmailLogCategory, EmailLogStatus } from '@prisma/client';
import { prisma } from '../lib/db.js';
export const findUserByEmail = async (email) => {
    return prisma.users.findUnique({
        where: { email },
    });
};
export const findUserByUsername = async (username) => {
    return prisma.users.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            profile_photo: true,
            created_at: true,
        },
    });
};
export const createUser = async (data, sendEmail) => {
    return prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
            data,
        });
        let log = null;
        if (data.role === Role.HOST) {
            await tx.admin_requests.create({
                data: {
                    action_type: ActionType.HOST_APPROVAL,
                    user_id: user.id,
                },
            });
        }
        else if (sendEmail) {
            log = await tx.email_logs.create({
                data: {
                    user_id: user.id,
                    category: EmailLogCategory.VERIFICATION,
                    payload: { email: user.email, name: user.username },
                    status: EmailLogStatus.PENDING,
                    email_id: null,
                },
            });
        }
        return { user, log };
    });
};
export const findUserById = async (id) => {
    return prisma.users.findUnique({
        where: { id },
    });
};
export const verifyUser = async (userId) => {
    return prisma.users.update({
        where: { id: userId },
        data: { is_verified: true },
    });
};
export const deleteUser = async (id) => {
    return prisma.users.delete({
        where: { id },
    });
};
export const updateUserPassword = async (userId, password, salt) => {
    return prisma.users.update({
        where: { id: userId },
        data: { password, salt },
    });
};
export const createVerifyToken = async (data) => {
    return prisma.verify_tokens.create({
        data,
    });
};
export const getVerifyTokenByToken = async (token) => {
    return prisma.verify_tokens.findUnique({
        where: {
            token,
        },
    });
};
export const deleteVerifyTokenByToken = async (token) => {
    return prisma.verify_tokens.delete({
        where: {
            token,
        },
    });
};
export const createResetToken = async (data) => {
    return prisma.reset_tokens.create({
        data,
    });
};
export const getResetTokenByToken = async (token) => {
    return prisma.reset_tokens.findUnique({
        where: {
            token,
        },
    });
};
export const deleteResetTokenByToken = async (token) => {
    return prisma.reset_tokens.delete({
        where: {
            token,
        },
    });
};
export const getAdminTokenByToken = async (token) => {
    return prisma.admin_tokens.findUnique({
        where: { token },
    });
};
export const createAdminToken = async (email, token, expires_in) => {
    return prisma.admin_tokens.create({
        data: { email, token, expires_in },
    });
};
export const deleteAdminTokenByToken = async (token) => {
    return prisma.admin_tokens.delete({
        where: { token },
    });
};
export const deleteAdminTokensByEmail = async (email) => {
    return prisma.admin_tokens.deleteMany({
        where: { email },
    });
};
export const findResetTokenByUserId = async (user_id) => {
    return prisma.reset_tokens.findFirst({
        where: {
            user_id: user_id,
            expires_in: { gt: new Date() }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};
export const updateUserStripeStatus = async (user_id, charges_enabled) => {
    return prisma.users.update({
        where: { id: user_id },
        data: {
            stripe_payout_enabled: charges_enabled
        }
    });
};
export const disableUserStripePayoutStatus = async (stripe_id) => {
    return prisma.users.updateMany({
        where: { stripe_account_id: stripe_id.toString() },
        data: {
            stripe_payout_enabled: false
        }
    });
};
export const enableUserStripePayoutStatus = async (stripe_id) => {
    return prisma.users.updateMany({
        where: { stripe_account_id: stripe_id.toString() },
        data: {
            stripe_payout_enabled: true
        }
    });
};
export const updateUserProfilePhoto = async (userId, url) => {
    return prisma.users.update({
        where: { id: userId },
        data: {
            profile_photo: url
        }
    });
};
export const resetUserPasswordAndRemoveToken = async (userId, password, salt, token) => {
    return prisma.$transaction([
        prisma.users.update({
            where: { id: userId },
            data: { password, salt },
        }),
        prisma.reset_tokens.delete({
            where: { token },
        }),
    ]);
};
export const finalizeUserRegistrationAndRemoveToken = async (userId, data, token) => {
    return prisma.$transaction([
        prisma.users.update({
            where: { id: userId },
            data,
        }),
        prisma.admin_tokens.delete({
            where: { token },
        }),
    ]);
};
//# sourceMappingURL=auth.service.js.map