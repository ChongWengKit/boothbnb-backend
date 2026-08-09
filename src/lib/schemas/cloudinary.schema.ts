import { z } from 'zod';

export const cloudinarySignatureSchema = z.object({
  timestamp: z.number().int().positive('Invalid timestamp'),
  folder: z.string().min(1, 'Folder is required'),
});