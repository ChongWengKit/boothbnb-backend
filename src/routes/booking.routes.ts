import { Router } from 'express';
import { getBookingById, getUserPaidBookings } from '../controllers/booking.controller.js';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { isVendor } from '../middleware/role.js';

const router = Router();
router.use(checkAuthenticationToken);

router.get('/', isVendor, getUserPaidBookings);
router.get('/:id', isVendor, getBookingById);

export default router;