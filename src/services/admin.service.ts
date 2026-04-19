import { prisma } from '../lib/db.js';
import { ActionType, AdminRequestStatus } from '@prisma/client';
export const createAdminRequest = async (action_type: ActionType, userId: number) => {
  return prisma.admin_requests.create({
    data: {
      action_type: action_type,
      user_id: userId,
    },
  });
};

export const updateAdminRequest = async (id: number, status: AdminRequestStatus) => {
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

export const deleteAdminRequestByUserId = async (userId: number) => {
  return prisma.admin_requests.deleteMany({
    where: {
      user_id: userId,
    },
  });
}
export const getAdminRequests = async (page = 1, limit = 10, action_type?: ActionType, search?: string, status?: AdminRequestStatus) => {
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

