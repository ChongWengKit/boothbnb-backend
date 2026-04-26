import { Router } from 'express';

const router = Router();
import { createEvent, searchEvents } from '../controllers/event.controller.js';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { getEventBySlug } from '../controllers/event.controller.js';
import { updateEvent } from '../controllers/event.controller.js';
import { publishEvent, closeEvent } from '../controllers/event.controller.js';
import { checkoutByUpdateEventReserved } from '../controllers/event.controller.js';
import { isHost } from '../middleware/role.js';
import { isVendor }  from '../middleware/role.js';
import { getEventDetailsBySlug } from '../controllers/event.controller.js';
import { getEventEditBySlug } from '../controllers/event.controller.js';

router.get('/',  searchEvents);
router.get('/:slug', getEventBySlug);
router.get('/:slug/detail', checkAuthenticationToken, isHost, getEventDetailsBySlug);
router.get('/:slug/edit', checkAuthenticationToken, isHost, getEventEditBySlug);
router.post('/', checkAuthenticationToken, isHost, createEvent);
router.put('/:slug', checkAuthenticationToken, isHost, updateEvent);
router.put('/:slug/publish', checkAuthenticationToken, isHost, publishEvent);
router.put('/:slug/close', checkAuthenticationToken, isHost, closeEvent);
router.post('/:slug/checkout', checkAuthenticationToken, isVendor, checkoutByUpdateEventReserved);

export default router;