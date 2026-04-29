import { prisma } from '../lib/db.js';

export const getCurrencyRate = async (currency: string) => {
  return prisma.currency_exchange.findUnique({
    where: { currency,
      is_enabled:true
     },
  });
};

export const getCurrency = async (currency: string) => {
  return prisma.currency_exchange.findUnique({
    where: { currency,
     },
  });
};

export const getAllCurrencyService = async () => {
  return prisma.currency_exchange.findMany({
    where: {
      is_enabled:true
     },
  });
};

export const getAllCurrencies = async (page: number = 1, limit: number = 20, search?: string, is_enabled?: boolean) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(search && {
      currency: {
        contains: search,
        mode: 'insensitive' as const
      }
    }),
    ...(is_enabled !== undefined && { is_enabled })
  };

  const [data, totalItems] = await Promise.all([
    prisma.currency_exchange.findMany({
      where,
      skip,
      take: limit,
      orderBy: { currency: 'asc' }
    }),
    prisma.currency_exchange.count({ where })
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    meta: {
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  };
};

export const updateCurrencyRate = async (currency: string, rate: number) => {
  return prisma.currency_exchange.upsert({
    where: { currency },
    update: { 
      rate,
      updated_at: new Date() 
    },
    create: {
      currency,
      rate,
    },
  });
};

export const updateCurrencyStatus = async (currency: string, is_enabled: boolean) => {
  return prisma.currency_exchange.update({
    where: { currency },
    data: {
      is_enabled,
    },
  });
};
