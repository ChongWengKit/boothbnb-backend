import { Router } from 'express';
import { getUserBookings, getBookingById } from '../controllers/booking.controller.js';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { isVendor } from '../middleware/role.js';

const router = Router();
router.use(checkAuthenticationToken);

router.get('/', isVendor, getUserBookings);
router.get('/:id', isVendor, getBookingById);

export default router;