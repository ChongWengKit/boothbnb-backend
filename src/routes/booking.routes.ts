import { Router } from 'express';
import { getBookingById, getUserPaidBookings } from '../controllers/booking.controller.js';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { isVendor } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { paginationQuerySchema, idParamSchema } from '../lib/schemas/common.schema.js';

const router = Router();
router.use(checkAuthenticationToken);

router.get('/', isVendor, validate({ query: paginationQuerySchema }), getUserPaidBookings);
router.get('/:id', isVendor, validate({ params: idParamSchema }), getBookingById);

export default router;