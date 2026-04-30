import { prisma } from '../lib/db.js';
export const getCurrencyRate = async (currency) => {
    return prisma.currency_exchange.findUnique({
        where: { currency,
            is_enabled: true
        },
    });
};
export const getCurrency = async (currency) => {
    return prisma.currency_exchange.findUnique({
        where: { currency,
        },
    });
};
export const getAllCurrencyService = async () => {
    return prisma.currency_exchange.findMany({
        where: {
            is_enabled: true
        },
    });
};
export const getAllCurrencies = async (page = 1, limit = 20, search, is_enabled) => {
    const skip = (page - 1) * limit;
    const where = {
        ...(search && {
            currency: {
                contains: search,
                mode: 'insensitive'
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
export const updateCurrencyRate = async (currency, rate) => {
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
export const updateCurrencyStatus = async (currency, is_enabled) => {
    return prisma.currency_exchange.update({
        where: { currency },
        data: {
            is_enabled,
        },
    });
};
//# sourceMappingURL=currency.service.js.map