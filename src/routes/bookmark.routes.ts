import { Router } from 'express';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { addFavorite, deleteFavorite, getFavorite } from '../controllers/bookmarks.controller.js';
import { getFavoriteBookmarkId } from '../controllers/bookmarks.controller.js';
import { isVendor } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { addFavoriteSchema, deleteFavoriteSchema } from '../lib/schemas/bookmark.schema.js';
import { paginationQuerySchema } from '../lib/schemas/common.schema.js';

const router = Router();

router.use(checkAuthenticationToken);
router.get('/favorite-id', isVendor, getFavoriteBookmarkId);
router.get('/favorite', isVendor, validate({ query: paginationQuerySchema }), getFavorite);
router.post('/add-favorite', isVendor, validate({ body: addFavoriteSchema }), addFavorite);
router.post('/delete-favorite', isVendor, validate({ body: deleteFavoriteSchema }), deleteFavorite);

export default router;