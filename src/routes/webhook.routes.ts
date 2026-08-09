import express, { Router } from 'express';
import { handleStripeWebhook } from '../controllers/stripe.controller.js';
import { handleResendWebhook } from '../controllers/mail.controller.js';
import { validate } from '../middleware/validate.js';
import { verifyResendWebhook } from '../middleware/webhook.js';
import { resendWebhookSchema } from '../lib/schemas/mail.schema.js';

const router = Router();

router.post('/stripe', handleStripeWebhook);

router.post(
    '/resend',
    verifyResendWebhook,
    validate({ body: resendWebhookSchema }),
    handleResendWebhook
);

export default router;