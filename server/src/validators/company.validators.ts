import { body } from 'express-validator';

export const updateCompanyValidation = [
  body('companyName').optional().trim().isLength({ min: 2, max: 200 }),
  body('industry').optional().trim(),
  body('website').optional().trim().isURL().withMessage('Must be a valid URL'),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('size').optional().isIn(['1-10', '11-50', '51-200', '201-500', '500+']),
];
