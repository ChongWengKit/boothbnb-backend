import { z } from 'zod';
import { isCloudinaryUrl } from './validation.js';
import { Category, BoothType } from '@prisma/client';

// Reusable validators
const isValidDateString = (val: string) => !isNaN(new Date(val).getTime());

export const cloudinaryUrlSchema = z
  .string()
  .refine((url) => isCloudinaryUrl(url), 'Must be a valid Cloudinary image URL');

const boothTypeValues = Object.values(BoothType) as [string, ...string[]];
const categoryValues = Object.values(Category) as [string, ...string[]];

// Booth schemas
export const boothSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(100),
  price: z.union([z.number().nonnegative(), z.string().regex(/^\d+(\.\d+)?$/)])
    .transform((v) => Number(v))
    .refine((v) => v >= 0, 'Booth price must be non-negative'),
  type: z.enum(boothTypeValues),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().finite(),
  description: z.string().max(1000).optional(),
});

export const createBoothSchema = boothSchema.omit({ id: true });

// Shared event base schema (all required fields)
const eventBaseSchema = z.object({
  title: z.string().min(3, 'Title must be between 3 and 100 characters').max(100, 'Title must be between 3 and 100 characters'),
  description: z.string().min(10, 'Description must be between 10 and 2000 characters').max(2000, 'Description must be between 10 and 2000 characters'),
  address: z.string().min(1, 'Address must be between 1 and 255 characters').max(255, 'Address must be between 1 and 255 characters'),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  start_date: z.string().refine(isValidDateString, 'Must be a valid date string'),
  end_date: z.string().refine(isValidDateString, 'Must be a valid date string'),
  category: z.enum(categoryValues),
  images: z.array(cloudinaryUrlSchema).max(5, 'Max 5 images'),
});

// CreateEvent schema: all fields required, dates validated.
// currency_code is NOT in the body - it is set from the `currency` header in the controller/service.
export const createEventSchema = eventBaseSchema.extend({
  booths: z.array(createBoothSchema).min(1, 'At least one booth is required'),
}).superRefine((data, ctx) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);

  if (start < new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['start_date'],
      message: 'Start date must be in the future',
    });
  }
  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['end_date'],
      message: 'End date must be after start date',
    });
  }
});

// UpdateEvent schema: partial, dates only validated if both present.
// currency_code is NOT in the body - it is set from the `currency` header in the controller/service.
export const updateEventSchema = eventBaseSchema.partial().extend({
  booths: z.array(boothSchema).optional(),
}).superRefine((data, ctx) => {
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_date'],
        message: 'End date must be after start date',
      });
    }
  }
});

// Type helpers
export type CreateEventInput = z.input<typeof createEventSchema>;
export type UpdateEventInput = z.input<typeof updateEventSchema>;