import { z } from 'zod';

const eventIdSchema = z.union([z.number().int().positive(), z.string().regex(/^\d+$/)])
  .transform((v) => Number(v))
  .refine((v) => Number.isInteger(v) && v > 0, 'Invalid event ID');

export const addFavoriteSchema = z.object({
  eventId: eventIdSchema,
});

export const deleteFavoriteSchema = z.object({
  eventId: eventIdSchema,
});