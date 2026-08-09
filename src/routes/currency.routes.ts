import { Router } from 'express';
import { getCurrency, getAllCurrency } from '../controllers/currecy.controller.js';
import { validate } from '../middleware/validate.js';
import { getCurrencyQuerySchema } from '../lib/schemas/currency.schema.js';

const router = Router();

router.get('/', validate({ query: getCurrencyQuerySchema }), getCurrency);
router.get('/all', getAllCurrency);

export default router;