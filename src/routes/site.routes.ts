import { Router } from 'express';
import { getAllEventSlug } from '../controllers/site.controllers.js';
const router = Router();

router.get('/',getAllEventSlug)

export default router;