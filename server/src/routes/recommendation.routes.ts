import { Router } from 'express';
import { getMyRecommendations, getCandidatesForJob, getMatchDetail, refreshRecommendations } from '../controllers/recommendation.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('JOB_SEEKER'), getMyRecommendations);
router.get('/job/:jobId/candidates', authenticate, authorize('EMPLOYER'), getCandidatesForJob);
router.get('/match/:jobId', authenticate, getMatchDetail);
router.post('/refresh', authenticate, authorize('JOB_SEEKER'), refreshRecommendations);

export default router;
