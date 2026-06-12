import { Router } from 'express';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';
import { updateAdminApproval, getApprovalRequests, registerAdmin } from '../controllers/admin.controller.js';
import { resendEmail, getEmailLogs } from '../controllers/mail.controller.js';
import { getAllCurrencyDetails, updateStatus } from '../controllers/currecy.controller.js';
const router = Router();
router.use(checkAuthenticationToken);
router.post('/register', isAdmin, registerAdmin);
router.post('/email', isAdmin, resendEmail);
router.get('/email', isAdmin, getEmailLogs);
router.put('/approval', isAdmin, updateAdminApproval);
router.get('/', isAdmin, getApprovalRequests);
router.get('/currency', isAdmin, getAllCurrencyDetails);
router.put('/currency', isAdmin, updateStatus);
export default router;
//# sourceMappingURL=admin.routes.js.map