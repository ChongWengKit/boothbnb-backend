import { Router } from 'express';
import { signup, signin, googleSignUp, googleSignIn, forgotPassword, resetPassword, adminSignup } from '../controllers/auth.controller.js';
import { verify } from '../controllers/email_verification.js';
const router = Router();
router.post('/signup', signup);
router.post('/verify', verify);
router.post('/signin', signin);
router.post('/google-signup', googleSignUp);
router.post('/google-signin', googleSignIn);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/admin-signup', adminSignup);
export default router;
//# sourceMappingURL=auth.routes.js.map