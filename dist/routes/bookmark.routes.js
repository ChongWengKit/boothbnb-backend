import { Router } from 'express';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { addFavorite, deleteFavorite, getFavorite } from '../controllers/bookmarks.controller.js';
import { getFavoriteBookmarkId } from '../controllers/bookmarks.controller.js';
import { isVendor } from '../middleware/role.js';
const router = Router();
router.use(checkAuthenticationToken);
router.get('/favorite-id', isVendor, getFavoriteBookmarkId);
router.get('/favorite', isVendor, getFavorite);
router.post('/add-favorite', isVendor, addFavorite);
router.post('/delete-favorite', isVendor, deleteFavorite);
export default router;
//# sourceMappingURL=bookmark.routes.js.map