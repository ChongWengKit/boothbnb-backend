import { z } from 'zod';
import { isCloudinaryUrl } from './validation.js';
import { Category, BoothType } from '@prisma/client';
import { paginationQuerySchema } from './schemas/common.schema.js';
const isValidDateString = (val: string) => !isNaN(new Date(val).getTime());

export const cloudinaryUrlSchema = z
  .string()
  .refine((url) => isCloudinaryUrl(url), 'Must be a valid Cloudinary image URL');

const boothTypeValues = Object.values(BoothType) as [string, ...string[]];
const categoryValues = Object.values(Category) as [string, ...string[]];

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

export const searchEventsQuerySchema = paginationQuerySchema.extend({
  title: z.string().optional(),
  category: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  ne_lat: z.coerce.number().optional(),
  ne_lng: z.coerce.number().optional(),
  sw_lat: z.coerce.number().optional(),
  sw_lng: z.coerce.number().optional(),
  extent: z.string().optional(),
  type: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type CreateEventInput = z.input<typeof createEventSchema>;
export type UpdateEventInput = z.input<typeof updateEventSchema>;