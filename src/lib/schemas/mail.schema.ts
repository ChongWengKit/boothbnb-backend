import { z } from 'zod';

export const resendWebhookSchema = z.object({
  type: z.string().min(1).optional(),
  data: z.object({
    email_id: z.union([z.string().min(1), z.number().int().positive()]),
  }),
});

export const resendEmailSchema = z.object({
  logId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
});