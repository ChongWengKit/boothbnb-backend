import { Router } from 'express';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { getAccount, getPublicAccount } from '../controllers/account.controller.js';
import { validate } from '../middleware/validate.js';
import { usernameParamSchema } from '../lib/schemas/common.schema.js';
import { paginationQuerySchema } from '../lib/schemas/common.schema.js';

const router = Router();

router.get('/', checkAuthenticationToken, validate({ query: paginationQuerySchema }), getAccount);
router.get('/:username', validate({ params: usernameParamSchema, query: paginationQuerySchema }), getPublicAccount);

export default router;