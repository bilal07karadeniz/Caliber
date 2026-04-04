import { body } from 'express-validator';

export const createJobValidation = [
  body('title').trim().notEmpty().isLength({ min: 2, max: 200 }),
  body('description').trim().notEmpty().isLength({ min: 10, max: 10000 }),
  body('requirements').trim().notEmpty().isLength({ min: 10, max: 5000 }),
  body('location').trim().notEmpty(),
  body('employmentType').isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']),
  body('salaryMin').optional().isInt({ min: 0 }),
  body('salaryMax').optional().isInt({ min: 0 }),
  body('skills').optional().isArray(),
  body('skills.*.name').optional().trim().notEmpty(),
  body('skills.*.requiredLevel').optional().isInt({ min: 1, max: 5 }),
];

export const updateJobValidation = [
  body('title').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 10000 }),
  body('requirements').optional().trim().isLength({ min: 10, max: 5000 }),
  body('location').optional().trim(),
  body('employmentType').optional().isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']),
  body('salaryMin').optional().isInt({ min: 0 }),
  body('salaryMax').optional().isInt({ min: 0 }),
  body('skills').optional().isArray(),
];
