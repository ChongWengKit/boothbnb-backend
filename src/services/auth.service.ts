
import { Prisma, ActionType, Role, EmailLogCategory, EmailLogStatus } from '@prisma/client';
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

export const createUser = async (data: Prisma.usersCreateInput, sendEmail: boolean) => {
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
    else if (sendEmail)
    {
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

export const disableUserStripePayoutStatus = async (stripe_id: string) => {
  return prisma.users.updateMany({
    where: { stripe_account_id: stripe_id.toString() },
    data:{
      stripe_payout_enabled: false
    }
  })
}

export const enableUserStripePayoutStatus = async (stripe_id: string) => {
  return prisma.users.updateMany({
    where: { stripe_account_id: stripe_id.toString() },
    data:{
      stripe_payout_enabled: true
    }
  })
}

export const updateUserProfilePhoto = async (userId: number, url: string) => {
  return prisma.users.update({
    where: { id: userId },
    data: {
      profile_photo: url
    }
  });
};

export const resetUserPasswordAndRemoveToken = async (userId: number, password: string, salt: string, token: string) => {
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

export const finalizeUserRegistrationAndRemoveToken = async (userId: number, data: { username: string; password?: string; salt?: string; is_verified: boolean }, token: string) => {
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