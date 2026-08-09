import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export const usernameParamSchema = z.object({
  username: z.string().min(1).max(50),
});

export const logIdParamSchema = z.object({
  logId: z.coerce.number().int().positive(),
});