import { Router } from 'express';
import { exportUserData, deleteAccount } from '../controllers/privacy.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/export', authenticate, exportUserData);
router.delete('/delete-account', authenticate, deleteAccount);

export default router;
