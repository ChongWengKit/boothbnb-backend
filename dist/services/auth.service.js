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
export const createUser = async (data) => {
    return prisma.users.create({
        data,
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
export const finalizeUserRegistration = async (userId, data) => {
    return prisma.users.update({
        where: { id: userId },
        data,
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
//# sourceMappingURL=auth.service.js.map