import { body } from 'express-validator';

export const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().trim(),
  body('location').optional().trim(),
  body('bio').optional().trim().isLength({ max: 2000 }),
];

export const updateSkillsValidation = [
  body('skills').isArray({ min: 0 }).withMessage('Skills must be an array'),
  body('skills.*.skillName').trim().notEmpty().withMessage('Skill name is required'),
  body('skills.*.proficiencyLevel').isInt({ min: 1, max: 5 }).withMessage('Proficiency must be 1-5'),
];
