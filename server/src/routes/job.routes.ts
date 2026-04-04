import { Router } from 'express';
import { createJob, updateJob, deleteJob, getJob, getAllJobs, getEmployerJobs } from '../controllers/job.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createJobValidation, updateJobValidation } from '../validators/job.validators';

const router = Router();

router.post('/', authenticate, authorize('EMPLOYER'), validate(createJobValidation), createJob);
router.get('/', getAllJobs);
router.get('/my-listings', authenticate, authorize('EMPLOYER'), getEmployerJobs);
router.get('/:id', getJob);
router.patch('/:id', authenticate, authorize('EMPLOYER'), validate(updateJobValidation), updateJob);
router.delete('/:id', authenticate, authorize('EMPLOYER', 'ADMIN'), deleteJob);

export default router;
