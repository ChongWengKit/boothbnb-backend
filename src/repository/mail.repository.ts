
import { EmailLogCategory, EmailLogStatus } from '@prisma/client';
import { prisma } from '../lib/db.js';

const logEmail = async (user_id: number, category: EmailLogCategory, payload: Record<string, any>, status: EmailLogStatus = EmailLogStatus.PENDING, email_id?: string ) => {

  return prisma.email_logs.create({
    data: {
      user_id,
      category,
      payload,
      status,
      email_id: email_id ?? null,
    },
  });
}

const updateEmailLogStatus = async (emailId: string, newStatus: EmailLogStatus) => {
  await prisma.email_logs.updateMany({
    where: { email_id: emailId },
    data: { status: newStatus }
  });
}


const getEmailLogById = async (id: number) => {
  return prisma.email_logs.findUnique({
    where: { id },
    select: {
      id: true,
      user_id: true,
      category: true,
      payload: true,
      status: true,
      email_id: true,
      attempts: true
    },
  });
};

const getAllEmailLogs = async (page: number, limit: number, status?: EmailLogStatus, category?: EmailLogCategory, search?: string) => {
  const where = {
    ...(status && { status }),
    ...(category && { category }),
    ...(search && {
      OR: [
        { payload: { path: ['name'], string_contains: search } },
        { payload: { path: ['email'], string_contains: search } }
      ]
    }),
  };

  const [result, totalItems] = await Promise.all([
    prisma.email_logs.findMany({
      where,
      orderBy: {
        id: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        user_id: true,
        category: true,
        payload: true,
        status: true,
        email_id: true,
        attempts: true,
      }
    }),
    prisma.email_logs.count({ where })
  ]);

  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = page;
  const itemsPerPage = limit;
  return {
    data: result,
    meta: {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    }
  };
};

export const mailRepository = {
  logEmail,
  updateEmailLogStatus,
  getEmailLogById,
  getAllEmailLogs
};