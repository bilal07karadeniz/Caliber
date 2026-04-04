import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';
import { notificationService } from '../services/notification.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['REVIEWED', 'REJECTED'],
  REVIEWED: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['ACCEPTED', 'REJECTED'],
  REJECTED: [],
  ACCEPTED: [],
};

export const applyToJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId, coverLetter } = req.body;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: 'Job not found or inactive' });
    }

    const existing = await prisma.application.findUnique({
      where: { userId_jobId: { userId: req.user!.userId, jobId } },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already applied to this job' });
    }

    const application = await prisma.application.create({
      data: { userId: req.user!.userId, jobId, coverLetter },
      include: { job: true },
    });

    // Notify employer
    try {
      await notificationService.notifyNewApplicant(job, req.user!.userId);
    } catch (e) { /* non-critical */ }

    return res.status(201).json({ success: true, data: application });
  } catch (error) {
    console.error('ApplyToJob error:', error);
    return res.status(500).json({ success: false, message: 'Failed to apply' });
  }
};

export const getMyApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const where: any = { userId: req.user!.userId };
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          job: {
            include: { employer: { include: { companyProfile: true } }, jobSkills: { include: { skill: true } } },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return res.json({
      success: true,
      data: { data: applications, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

export const getApplicationsForJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
    if (!job || job.employerId !== req.user!.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const sortBy = (req.query.sortBy as string) || 'appliedAt';

    const where: any = { jobId: req.params.jobId };
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, location: true, bio: true },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return res.json({
      success: true,
      data: { data: applications, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

export const getApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, bio: true, location: true } },
        job: { include: { employer: true, jobSkills: { include: { skill: true } } } },
      },
    });

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (application.userId !== req.user!.userId && application.job.employerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    return res.json({ success: true, data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch application' });
  }
};

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.job.employerId !== req.user!.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { status } = req.body;
    const allowed = VALID_TRANSITIONS[application.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${application.status} to ${status}`,
      });
    }

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
    });

    try {
      await notificationService.notifyApplicationStatusChange(application, status);
    } catch (e) { /* non-critical */ }

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

export const withdrawApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const application = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (!['PENDING', 'REVIEWED'].includes(application.status)) {
      return res.status(400).json({ success: false, message: 'Cannot withdraw at this stage' });
    }

    await prisma.application.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Application withdrawn' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to withdraw' });
  }
};
