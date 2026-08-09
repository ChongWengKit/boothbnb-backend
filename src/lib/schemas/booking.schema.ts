import { z } from 'zod';

export const bookingIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid booking ID'),
});

export const checkoutSchema = z.object({
  eventId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, 'Invalid event ID'),
  boothId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)])
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v > 0, 'Invalid booth ID'),
});