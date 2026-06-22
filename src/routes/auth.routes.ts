import { Router } from 'express';
import { signup, verify, signin, googleSignUp, googleSignIn, forgotPassword, resetPassword, adminSignup } from '../controllers/auth.controller.js';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { updateProfilePhoto } from '../controllers/account.controller.js';

const router = Router();

router.post('/signup', signup);
router.post('/verify', verify);
router.post('/signin', signin);
router.post('/google-signup', googleSignUp);
router.post('/google-signin', googleSignIn);
router.post('/forgot-password', forgotPassword); 
router.post('/reset-password', resetPassword);
router.post('/admin-signup', adminSignup);
router.put('/photo', checkAuthenticationToken, updateProfilePhoto);
export default router;