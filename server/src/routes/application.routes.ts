import { Router } from 'express';
import { applyToJob, getMyApplications, getApplicationsForJob, getApplication, updateApplicationStatus, withdrawApplication } from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { applyValidation, updateStatusValidation } from '../validators/application.validators';

const router = Router();

router.post('/', authenticate, authorize('JOB_SEEKER'), validate(applyValidation), applyToJob);
router.get('/my', authenticate, authorize('JOB_SEEKER'), getMyApplications);
router.get('/job/:jobId', authenticate, authorize('EMPLOYER'), getApplicationsForJob);
router.get('/:id', authenticate, getApplication);
router.patch('/:id/status', authenticate, authorize('EMPLOYER'), validate(updateStatusValidation), updateApplicationStatus);
router.delete('/:id', authenticate, authorize('JOB_SEEKER'), withdrawApplication);

export default router;
