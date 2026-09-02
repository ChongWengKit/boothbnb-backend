import { Router } from 'express';

const router = Router();
import { createEvent, searchEvents } from '../controllers/event.controller.js';
import { checkAuthenticationToken, optionalAuthToken } from '../middleware/auth.js';
import { getEventBySlug } from '../controllers/event.controller.js';
import { updateEvent } from '../controllers/event.controller.js';
import { publishEvent, closeEvent } from '../controllers/event.controller.js';
import { checkoutByUpdateEventReserved } from '../controllers/event.controller.js';
import { isHost } from '../middleware/role.js';
import { isVendor } from '../middleware/role.js';
import { getEventDetailsBySlug } from '../controllers/event.controller.js';
import { getEventEditBySlug } from '../controllers/event.controller.js';
import { validate } from '../middleware/validate.js';
import { createEventSchema, updateEventSchema } from '../lib/event.schema.js';
import { slugParamSchema } from '../lib/schemas/common.schema.js';
import { checkoutSchema } from '../lib/schemas/booking.schema.js';
import { searchEventsQuerySchema } from '../lib/event.schema.js';

router.get('/', validate({ query: searchEventsQuerySchema }), optionalAuthToken, searchEvents);
router.get('/:slug', validate({ params: slugParamSchema }), optionalAuthToken, getEventBySlug);
router.get('/:slug/detail', checkAuthenticationToken, isHost, validate({ params: slugParamSchema }), getEventDetailsBySlug);
router.get('/:slug/edit', checkAuthenticationToken, isHost, validate({ params: slugParamSchema }), getEventEditBySlug);
router.post('/', checkAuthenticationToken, isHost, validate({ body: createEventSchema }), createEvent);
router.put('/:slug', checkAuthenticationToken, isHost, validate({ params: slugParamSchema, body: updateEventSchema }), updateEvent);
router.put('/:slug/publish', checkAuthenticationToken, isHost, validate({ params: slugParamSchema }), publishEvent);
router.put('/:slug/close', checkAuthenticationToken, isHost, validate({ params: slugParamSchema }), closeEvent);
router.post('/:slug/checkout', checkAuthenticationToken, isVendor, validate({ params: slugParamSchema, body: checkoutSchema }), checkoutByUpdateEventReserved);

export default router;