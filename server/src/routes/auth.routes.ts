import { Router } from 'express';
import { register, login, refreshTokenHandler, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerValidation, loginValidation } from '../validators/auth.validators';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(registerValidation), register);
router.post('/login', authLimiter, validate(loginValidation), login);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
