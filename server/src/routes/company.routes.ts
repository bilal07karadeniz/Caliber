import { Router } from 'express';
import { updateCompanyProfile, getCompanyProfile, getAllCompanies } from '../controllers/company.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateCompanyValidation } from '../validators/company.validators';

const router = Router();

router.put('/profile', authenticate, authorize('EMPLOYER'), validate(updateCompanyValidation), updateCompanyProfile);
router.get('/:userId', getCompanyProfile);
router.get('/', getAllCompanies);

export default router;
