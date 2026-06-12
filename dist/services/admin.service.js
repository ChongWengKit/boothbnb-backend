import { prisma } from '../lib/db.js';
import { AdminRequestStatus } from '@prisma/client';
import { EmailLogStatus } from '@prisma/client';
export const createAdminRequest = async (action_type, userId) => {
    return prisma.admin_requests.create({
        data: {
            action_type: action_type,
            user_id: userId,
        },
    });
};
export const findAdminRequestById = async (id) => {
    return prisma.admin_requests.findUnique({
        where: {
            id,
        },
    });
};
export const updateAdminRequest = async (id, status) => {
    return prisma.admin_requests.update({
        where: {
            id,
            status: AdminRequestStatus.PENDING,
        },
        data: {
            status,
        },
    });
};
export const deleteAdminRequestByUserId = async (userId) => {
    return prisma.admin_requests.deleteMany({
        where: {
            user_id: userId,
        },
    });
};
export const getAdminRequests = async (page = 1, limit = 10, action_type, search, status) => {
    const whereClause = {
        ...(status ? { status } : {}),
        ...(action_type ? { action_type } : {}),
        ...(search && {
            OR: [
                {
                    user: {
                        username: {
                            contains: search,
                        },
                    },
                },
                {
                    user: {
                        email: {
                            contains: search,
                        },
                    },
                },
            ],
        }),
    };
    const pendingRequests = await prisma.admin_requests.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });
    const totalItems = await prisma.admin_requests.count({
        where: whereClause,
    });
    const totalPages = Math.ceil(totalItems / limit);
    return {
        data: pendingRequests.map(request => ({
            ...request,
            user: {
                id: request.user.id,
                username: request.user.username,
                email: request.user.email,
            },
        })),
        meta: {
            totalItems,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};
export const createUserAndLogEmail = async (data, category, payload, status = EmailLogStatus.PENDING, email_id) => {
    const tx = await prisma.$transaction(async (tx) => {
        const newUser = await tx.users.create({ data });
        const log = await tx.email_logs.create({
            data: {
                user_id: newUser.id,
                category,
                payload,
                status,
                email_id: email_id ?? null,
            },
        });
        return { user: newUser, log };
    });
    return tx;
};
export const approveAdminRequestAndVerifyUser = async (requestId, userId, status, emailCategory, emailPayload) => {
    return prisma.$transaction(async (tx) => {
        const request = await tx.admin_requests.update({
            where: { id: requestId, status: AdminRequestStatus.PENDING },
            data: { status },
        });
        const user = await tx.users.update({
            where: { id: userId },
            data: { is_verified: true },
        });
        const log = await tx.email_logs.create({
            data: {
                user_id: userId,
                category: emailCategory,
                payload: emailPayload,
                status: EmailLogStatus.PENDING,
            },
        });
        return { log };
    });
};
export const deleteUserAndAdminRequests = async (userId) => {
    return prisma.$transaction([
        prisma.admin_requests.deleteMany({
            where: {
                user_id: userId,
            },
        }),
        prisma.users.delete({
            where: { id: userId },
        }),
    ]);
};
//# sourceMappingURL=admin.service.js.map