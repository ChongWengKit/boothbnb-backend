import { Router } from 'express';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { getAccount, getPublicAccount } from '../controllers/account.controller.js';

const router = Router();

router.get('/', checkAuthenticationToken, getAccount);
router.get('/:username', getPublicAccount);

export default router;