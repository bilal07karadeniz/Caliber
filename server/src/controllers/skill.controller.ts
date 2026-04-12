import { Request, Response } from 'express';
import prisma from '../config/database';

export const getSkills = async (req: Request, res: Response) => {
  try {
    const { search, category, limit } = req.query;
    const take = Math.min(Number(limit) || 50, 100);

    const where: any = {};
    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }
    if (category) {
      where.category = String(category);
    }

    const skills = await prisma.skill.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      take,
    });

    return res.json({ success: true, data: skills });
  } catch (error) {
    console.error('GetSkills error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch skills' });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.skill.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return res.json({ success: true, data: categories.map((c) => c.category) });
  } catch (error) {
    console.error('GetCategories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};
