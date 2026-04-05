import { Router } from 'express';
import { register, login, refreshTokenHandler, logout, getMe, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, verifyEmailChange, verifyLoginOTP } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, verifyEmailValidation } from '../validators/auth.validators';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(registerValidation), register);
router.post('/login', authLimiter, validate(loginValidation), login);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/verify-email', validate(verifyEmailValidation), verifyEmail);
router.post('/resend-verification', authLimiter, validate(forgotPasswordValidation), resendVerificationEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordValidation), resetPassword);
router.post('/verify-email-change', validate(verifyEmailValidation), verifyEmailChange);
router.post('/verify-otp', verifyLoginOTP);

export default router;
