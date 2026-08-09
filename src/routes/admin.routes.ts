import { Router } from 'express';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';
import { updateAdminApproval, getApprovalRequests, registerAdmin } from '../controllers/admin.controller.js';
import { resendEmail, getEmailLogs } from '../controllers/mail.controller.js';
import { getAllCurrencyDetails, updateStatus } from '../controllers/currecy.controller.js';
import { validate } from '../middleware/validate.js';
import { registerAdminSchema, updateAdminApprovalSchema, getApprovalRequestsQuerySchema } from '../lib/schemas/admin.schema.js';
import { paginationQuerySchema } from '../lib/schemas/common.schema.js';
import { resendEmailSchema } from '../lib/schemas/mail.schema.js';
import { updateCurrencyStatusSchema, getAllCurrencyDetailsQuerySchema } from '../lib/schemas/currency.schema.js';

const router = Router();
router.use(checkAuthenticationToken);

router.post('/register', isAdmin, validate({ body: registerAdminSchema }), registerAdmin);
router.post('/email', isAdmin, validate({ body: resendEmailSchema }), resendEmail);
router.get('/email', isAdmin, validate({ query: paginationQuerySchema }), getEmailLogs);
router.put('/approval', isAdmin, validate({ body: updateAdminApprovalSchema }), updateAdminApproval);
router.get('/', isAdmin, validate({ query: getApprovalRequestsQuerySchema }), getApprovalRequests);
router.get('/currency', isAdmin, validate({ query: getAllCurrencyDetailsQuerySchema }), getAllCurrencyDetails);
router.put('/currency', isAdmin, validate({ body: updateCurrencyStatusSchema }), updateStatus);

export default router;