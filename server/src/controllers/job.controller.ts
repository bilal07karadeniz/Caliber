import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

export const createJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, requirements, location, salaryMin, salaryMax, employmentType, skills } = req.body;

    const job = await prisma.$transaction(async (tx) => {
      const newJob = await tx.job.create({
        data: {
          employerId: req.user!.userId,
          title,
          description,
          requirements,
          location,
          salaryMin,
          salaryMax,
          employmentType,
        },
      });

      if (skills?.length) {
        for (const s of skills) {
          const skill = await tx.skill.upsert({
            where: { name: s.name },
            update: {},
            create: { name: s.name },
          });
          await tx.jobSkill.create({
            data: { jobId: newJob.id, skillId: skill.id, requiredLevel: s.requiredLevel },
          });
        }
      }

      return tx.job.findUnique({
        where: { id: newJob.id },
        include: { jobSkills: { include: { skill: true } }, employer: { include: { companyProfile: true } } },
      });
    });

    return res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('CreateJob error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create job' });
  }
};

export const updateJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.employerId !== req.user!.userId) {
      return res.status(403).json({ success: false, message: 'Not your job posting' });
    }

    const { title, description, requirements, location, salaryMin, salaryMax, employmentType, skills } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id: req.params.id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(requirements && { requirements }),
          ...(location && { location }),
          ...(salaryMin !== undefined && { salaryMin }),
          ...(salaryMax !== undefined && { salaryMax }),
          ...(employmentType && { employmentType }),
        },
      });

      if (skills) {
        await tx.jobSkill.deleteMany({ where: { jobId: req.params.id } });
        for (const s of skills) {
          const skill = await tx.skill.upsert({
            where: { name: s.name },
            update: {},
            create: { name: s.name },
          });
          await tx.jobSkill.create({
            data: { jobId: req.params.id, skillId: skill.id, requiredLevel: s.requiredLevel },
          });
        }
      }

      return tx.job.findUnique({
        where: { id: req.params.id },
        include: { jobSkills: { include: { skill: true } } },
      });
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('UpdateJob error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update job' });
  }
};

export const deleteJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (req.user!.role !== 'ADMIN' && job.employerId !== req.user!.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await prisma.job.update({ where: { id: req.params.id }, data: { isActive: false } });
    return res.json({ success: true, message: 'Job deactivated' });
  } catch (error) {
    console.error('DeleteJob error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete job' });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        employer: { include: { companyProfile: true } },
        jobSkills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    return res.json({ success: true, data: job });
  } catch (error) {
    console.error('GetJob error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch job' });
  }
};

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const location = req.query.location as string;
    const employmentType = req.query.employmentType as string;
    const salaryMin = req.query.salaryMin ? parseInt(req.query.salaryMin as string) : undefined;
    const salaryMax = req.query.salaryMax ? parseInt(req.query.salaryMax as string) : undefined;
    const skillsFilter = req.query.skills as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (employmentType) where.employmentType = employmentType;
    if (salaryMin) where.salaryMax = { gte: salaryMin };
    if (salaryMax) where.salaryMin = { lte: salaryMax };
    if (skillsFilter) {
      const skillNames = skillsFilter.split(',').map((s) => s.trim());
      where.jobSkills = { some: { skill: { name: { in: skillNames } } } };
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          employer: { include: { companyProfile: true } },
          jobSkills: { include: { skill: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return res.json({
      success: true,
      data: { data: jobs, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GetAllJobs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
  }
};

export const getEmployerJobs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const where = { employerId: req.user!.userId };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          jobSkills: { include: { skill: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return res.json({
      success: true,
      data: { data: jobs, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GetEmployerJobs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
  }
};
