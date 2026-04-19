import { Router } from 'express';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { generateCloudinarySignatureAction } from '../controllers/cloudinary.controller.js';
const router = Router();
router.post('/signature',checkAuthenticationToken, generateCloudinarySignatureAction);

export default router;