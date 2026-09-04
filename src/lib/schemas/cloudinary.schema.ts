import { z } from 'zod';
import { CLOUDINARY_UPLOAD_FOLDERS } from '../constants/cloudinary.js';

export const cloudinarySignatureSchema = z.object({
  timestamp: z.number().int().positive('Invalid timestamp'),
  folder: z.enum(CLOUDINARY_UPLOAD_FOLDERS, { message: 'Folder is not allowed' }),
});