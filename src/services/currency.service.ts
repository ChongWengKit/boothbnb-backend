import { prisma } from '../lib/db.js';

export const getCurrencyRate = async (currency: string) => {
  return prisma.currency_exchange.findUnique({
    where: { currency,
      is_enabled:true
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