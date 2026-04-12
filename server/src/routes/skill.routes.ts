import { Router } from 'express';
import { getSkills, getCategories } from '../controllers/skill.controller';

const router = Router();

router.get('/', getSkills);
router.get('/categories', getCategories);

export default router;
