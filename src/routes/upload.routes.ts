import { Router } from 'express';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { generateCloudinarySignatureAction } from '../controllers/cloudinary.controller.js';
import { validate } from '../middleware/validate.js';
import { cloudinarySignatureSchema } from '../lib/schemas/cloudinary.schema.js';

const router = Router();
router.post('/signature', checkAuthenticationToken, validate({ body: cloudinarySignatureSchema }), generateCloudinarySignatureAction);

export default router;