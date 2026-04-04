import { Router } from 'express';
import { getSkillGapForJob, getCareerInsights, getLearningPath } from '../controllers/skillgap.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/job/:jobId', authenticate, getSkillGapForJob);
router.get('/career-insights', authenticate, getCareerInsights);
router.get('/learning-path', authenticate, getLearningPath);

export default router;
