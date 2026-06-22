import { Router } from 'express';
import { bookingCleanupHandler, currencyUpdateHandler, emailRetryHandler, emailSyncHandler } from '../controllers/cron.controller.js';
import { authenticateCron } from '../middleware/cron.js';

const router = Router();

router.use(authenticateCron);

router.get('/booking-cleanup', bookingCleanupHandler);
router.get('/email-retry', emailRetryHandler);
router.get('/email-sync', emailSyncHandler);
router.get('/currency-update', currencyUpdateHandler)
export default router;