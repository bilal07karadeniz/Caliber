import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

export const updateCompanyProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyName, industry, website, description, size } = req.body;
    const profile = await prisma.companyProfile.upsert({
      where: { userId: req.user!.userId },
      update: {
        ...(companyName && { companyName }),
        ...(industry !== undefined && { industry }),
        ...(website !== undefined && { website }),
        ...(description !== undefined && { description }),
        ...(size !== undefined && { size }),
      },
      create: {
        userId: req.user!.userId,
        companyName: companyName || 'My Company',
        industry,
        website,
        description,
        size,
      },
    });

    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error('UpdateCompanyProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update company profile' });
  }
};

export const getCompanyProfile = async (req: Request, res: Response) => {
  try {
    const profile = await prisma.companyProfile.findUnique({
      where: { userId: req.params.userId },
      include: {
        user: {
          select: { name: true, email: true, avatar: true },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const jobCount = await prisma.job.count({
      where: { employerId: req.params.userId, isActive: true },
    });

    return res.json({ success: true, data: { ...profile, activeJobCount: jobCount } });
  } catch (error) {
    console.error('GetCompanyProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch company' });
  }
};

export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const industry = req.query.industry as string;

    const where: any = {};
    if (search) where.companyName = { contains: search, mode: 'insensitive' };
    if (industry) where.industry = industry;

    const [companies, total] = await Promise.all([
      prisma.companyProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { name: true, avatar: true } } },
      }),
      prisma.companyProfile.count({ where }),
    ]);

    return res.json({
      success: true,
      data: { data: companies, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GetAllCompanies error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch companies' });
  }
};
