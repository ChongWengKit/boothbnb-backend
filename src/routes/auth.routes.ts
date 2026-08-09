import { Router } from 'express';
import { signup, verify, signin, googleSignUp, googleSignIn, forgotPassword, resetPassword, adminSignup } from '../controllers/auth.controller.js';
import { checkAuthenticationToken } from '../middleware/auth.js';
import { updateProfilePhoto } from '../controllers/account.controller.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, verifySchema, signinSchema, googleSignUpSchema, googleSignInSchema, forgotPasswordSchema, resetPasswordSchema, adminSignupSchema, updateProfilePhotoSchema } from '../lib/schemas/auth.schema.js';

const router = Router();

router.post('/signup', validate({ body: signupSchema }), signup);
router.post('/verify', validate({ body: verifySchema }), verify);
router.post('/signin', validate({ body: signinSchema }), signin);
router.post('/google-signup', validate({ body: googleSignUpSchema }), googleSignUp);
router.post('/google-signin', validate({ body: googleSignInSchema }), googleSignIn);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), resetPassword);
router.post('/admin-signup', validate({ body: adminSignupSchema }), adminSignup);
router.put('/photo', checkAuthenticationToken, validate({ body: updateProfilePhotoSchema }), updateProfilePhoto);
export default router;