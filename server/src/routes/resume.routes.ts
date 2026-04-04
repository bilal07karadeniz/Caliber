import { Router } from 'express';
import { uploadResume as uploadResumeHandler, getResumes, getResume, deleteResume, downloadResume } from '../controllers/resume.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadResume } from '../config/upload';

const router = Router();

router.post('/upload', authenticate, authorize('JOB_SEEKER'), uploadResume.single('resume'), uploadResumeHandler);
router.get('/', authenticate, getResumes);
router.get('/:id', authenticate, getResume);
router.get('/:id/download', authenticate, downloadResume);
router.delete('/:id', authenticate, deleteResume);

export default router;
