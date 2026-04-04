import { Router } from 'express';
import { getDashboardStats, getSystemHealth, getUserActivity, getAiMetrics, manageJob } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, authorize('ADMIN'), getDashboardStats);
router.get('/system-health', authenticate, authorize('ADMIN'), getSystemHealth);
router.get('/user-activity', authenticate, authorize('ADMIN'), getUserActivity);
router.get('/ai-metrics', authenticate, authorize('ADMIN'), getAiMetrics);
router.patch('/jobs/:id', authenticate, authorize('ADMIN'), manageJob);

export default router;
