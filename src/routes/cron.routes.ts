import { Router, Request, Response, NextFunction } from 'express';
import { bookingCleanupHandler, emailRetryHandler, emailSyncHandler } from '../controllers/cron.controller.js';
import { authenticateCron } from '../middleware/cron.js';

const router = Router();

router.use(authenticateCron);

router.get('/booking-cleanup', bookingCleanupHandler);
router.get('/email-retry', emailRetryHandler);
router.get('/email-sync', emailSyncHandler);

export default router;