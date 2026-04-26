
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/db.js';

export const findUserByEmail = async (email: string) => {
  return prisma.users.findUnique({
    where: { email },
  });
};

export const findUserByUsername = async (username: string) => {
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

export const createUser = async (data: Prisma.usersCreateInput) => {
  return prisma.users.create({
    data,
  });
};

export const findUserById = async (id: number) => {
  return prisma.users.findUnique({
    where: { id },
  });
};

export const verifyUser = async (userId: number) => {
  return prisma.users.update({
    where: { id: userId },
    data: { is_verified: true },
  });
};

export const deleteUser = async (id: number) => {
  return prisma.users.delete({
    where: { id },
  });
};
export const updateUserPassword = async (userId: number, password: string, salt: string) => {
  return prisma.users.update({
    where: { id: userId },
    data: { password, salt },
  });
};

export const createVerifyToken = async (data: Prisma.verify_tokensCreateInput) => {
  return prisma.verify_tokens.create({
    data,
  });
};
export const getVerifyTokenByToken = async (token: string) => {
  return prisma.verify_tokens.findUnique({
    where: {
      token,
    },
  });
};
export const deleteVerifyTokenByToken = async (token: string) => {
  return prisma.verify_tokens.delete({
    where: {
      token,
    },
  });
};

export const createResetToken = async (data: Prisma.reset_tokensCreateInput) => {
  return prisma.reset_tokens.create({
    data,
  });
};
export const getResetTokenByToken = async (token: string) => {
  return prisma.reset_tokens.findUnique({
    where: {
      token,
    },
  });
};
export const deleteResetTokenByToken = async (token: string) => {
  return prisma.reset_tokens.delete({
    where: {
      token,
    },
  });
};

export const getAdminTokenByToken = async (token: string) => {
  return prisma.admin_tokens.findUnique({
    where: { token },
  });
};

export const createAdminToken = async (email: string, token: string, expires_in: Date) => {
  return prisma.admin_tokens.create({
    data: { email, token, expires_in },
  });
};

export const deleteAdminTokenByToken = async (token: string) => {
  return prisma.admin_tokens.delete({
    where: { token },
  });
};

export const deleteAdminTokensByEmail = async (email: string) => {
  return prisma.admin_tokens.deleteMany({
    where: { email },
  });
};

export const finalizeUserRegistration = async (userId: number, data: { username: string; password?: string; salt?: string; is_verified: boolean }) => {
  return prisma.users.update({
    where: { id: userId },
    data,
  });
};

export const findResetTokenByUserId = async (user_id: number) => {
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

export const updateUserStripeStatus = async (user_id: number, charges_enabled: boolean) => {
  return prisma.users.update({
    where: { id: user_id },
    data: {
      stripe_payout_enabled: charges_enabled
    }
  });
}

export const updateUserProfilePhoto = async (userId: number, url: string) => {
  return prisma.users.update({
    where: { id: userId },
    data: {
      profile_photo: url
    }
  });
};
