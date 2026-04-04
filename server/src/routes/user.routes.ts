import { Router } from 'express';
import { getProfile, updateProfile, updateSkills, getAllUsers, toggleUserActive, uploadAvatar as uploadAvatarHandler } from '../controllers/user.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileValidation, updateSkillsValidation } from '../validators/user.validators';
import { uploadAvatar } from '../config/upload';

const router = Router();

router.get('/me', authenticate, getProfile);
router.get('/:id', optionalAuth, getProfile);
router.patch('/me', authenticate, validate(updateProfileValidation), updateProfile);
router.put('/me/skills', authenticate, validate(updateSkillsValidation), updateSkills);
router.post('/me/avatar', authenticate, uploadAvatar.single('avatar'), uploadAvatarHandler);
router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.patch('/:id/toggle-active', authenticate, authorize('ADMIN'), toggleUserActive);

export default router;
