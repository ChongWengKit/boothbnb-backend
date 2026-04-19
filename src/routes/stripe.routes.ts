import { Router } from 'express';
import { isHost } from '../middleware/role.js';
import { createStripeConnectAccount, checkStripeStatus } from '../controllers/stripe.controller.js';
import { checkAuthenticationToken } from '../middleware/auth.js';

const router = Router();
router.use(checkAuthenticationToken);

router.post('/connect', isHost,createStripeConnectAccount);
router.get('/status', isHost, checkStripeStatus);


export default router;