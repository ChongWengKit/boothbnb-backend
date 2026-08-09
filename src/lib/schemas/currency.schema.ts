import { z } from 'zod';
import { paginationQuerySchema } from './common.schema.js';

export const getCurrencyQuerySchema = z.object({
  currencyCode: z.string().min(3).max(3).regex(/^[A-Za-z]{3}$/, 'currencyCode query parameter is required'),
});

export const getAllCurrencyDetailsQuerySchema = paginationQuerySchema
  .extend({
    search: z.string().optional(),
    status: z.enum(['true', 'false']).optional(),
  });

export const updateCurrencyStatusSchema = z.object({
  currency: z.string().min(3).max(3).regex(/^[A-Za-z]{3}$/, 'Currency is required'),
  is_enabled: z.boolean('is_enabled status is required'),
});