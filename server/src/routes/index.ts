import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import companyRoutes from './company.routes';
import jobRoutes from './job.routes';
import resumeRoutes from './resume.routes';
import applicationRoutes from './application.routes';
import recommendationRoutes from './recommendation.routes';
import skillgapRoutes from './skillgap.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';
import privacyRoutes from './privacy.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/resumes', resumeRoutes);
router.use('/applications', applicationRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/skill-gap', skillgapRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/privacy', privacyRoutes);

export default router;
