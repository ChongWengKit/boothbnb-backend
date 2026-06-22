import { prisma } from '../lib/db.js';
import { ActionType, AdminRequestStatus, Prisma } from '@prisma/client';
import { EmailLogCategory } from '@prisma/client';
import { EmailLogStatus } from '@prisma/client';

const createAdminRequest = async (action_type: ActionType, userId: number) => {
  return prisma.admin_requests.create({
    data: {
      action_type: action_type,
      user_id: userId,
    },
  });
};

const findAdminRequestById = async (id: number) => {
  return prisma.admin_requests.findUnique({
    where: {
      id,
    },
  });
};

const updateAdminRequest = async (id: number, status: AdminRequestStatus) => {
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

const deleteAdminRequestByUserId = async (userId: number) => {
  return prisma.admin_requests.deleteMany({
    where: {
      user_id: userId,
    },
  });
}
const getAdminRequests = async (page = 1, limit = 10, action_type?: ActionType, search?: string, status?: AdminRequestStatus) => {
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

const createUserAndLogEmail = async (data: Prisma.usersCreateInput, category: EmailLogCategory, payload: Record<string, any>, status: EmailLogStatus = EmailLogStatus.PENDING, email_id?: string) => {
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

const approveAdminRequestAndVerifyUser = async (
  requestId: number,
  userId: number,
  status: AdminRequestStatus,
  emailCategory: EmailLogCategory,
  emailPayload: Record<string, any>
) => {
  return prisma.$transaction(async (tx) => {
    const request = await tx.admin_requests.update({
      where: { id: requestId, status: AdminRequestStatus.PENDING },
      data: { status },
    });
    let log;
    if (status === AdminRequestStatus.APPROVED) {
      await tx.users.update({
        where: { id: userId },
        data: { is_verified: true },
      });
      log = await tx.email_logs.create({
        data: {
          user_id: userId,
          category: emailCategory,
          payload: emailPayload,
          status: EmailLogStatus.PENDING,
        },
      });
    }
    return {log}
  });
};


const deleteUserAndAdminRequests = async (userId: number) => {
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

export const adminRepository = {
  createAdminRequest,
  findAdminRequestById,
  updateAdminRequest,
  getAdminRequests,
  deleteAdminRequestByUserId,
  createUserAndLogEmail,
  approveAdminRequestAndVerifyUser,
  deleteUserAndAdminRequests,
}