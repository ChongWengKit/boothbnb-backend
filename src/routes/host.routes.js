import { Router } from 'express';
import { findEventsByHostId } from '../controllers/event.controller.js';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { isHost } from '../middleware/role.js';
const router = Router();
router.use(checkAuthenticationToken);
router.get('/event', isHost, findEventsByHostId);
export default router;
//# sourceMappingURL=host.routes.js.map