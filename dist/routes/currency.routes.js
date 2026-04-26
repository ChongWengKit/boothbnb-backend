import { Router } from 'express';
import { getCurrency, getAllCurrency } from '../controllers/currecy.controller.js';
const router = Router();
router.get('/', getCurrency);
router.get('/all', getAllCurrency);
export default router;
//# sourceMappingURL=currency.routes.js.map