import { body } from 'express-validator';

export const applyValidation = [
  body('jobId').notEmpty().withMessage('Job ID is required'),
  body('coverLetter').optional().trim().isLength({ max: 5000 }),
];

export const updateStatusValidation = [
  body('status').isIn(['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'])
    .withMessage('Invalid status'),
];
