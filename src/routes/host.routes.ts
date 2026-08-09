import { Router } from 'express';
import { findEventsByHostId } from '../controllers/event.controller.js';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { isHost } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { paginationQuerySchema } from '../lib/schemas/common.schema.js';
import { z } from 'zod';

const hostEventQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional(),
  search: z.string().optional(),
});

const router = Router();

router.use(checkAuthenticationToken);
router.get('/event', isHost, validate({ query: hostEventQuerySchema }), findEventsByHostId);

export default router;