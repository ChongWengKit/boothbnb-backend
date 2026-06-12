import express, { Router } from 'express';
import { handleStripeWebhook } from '../controllers/stripe.controller.js';
import { handleResendWebhook } from '../controllers/mail.controller.js';
const router = Router();
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.post('/resend', express.json(), handleResendWebhook);
export default router;
//# sourceMappingURL=webhook.routes.js.map