import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';
import { aiEngineService } from '../services/aiEngine.service';

export const getMyRecommendations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check profile completeness
    const userProfile = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { userSkills: true, resumes: { where: { isActive: true } } },
    });
    if (!userProfile?.userSkills?.length && !userProfile?.resumes?.length) {
      return res.json({ success: true, data: [], message: 'PROFILE_INCOMPLETE' });
    }

    // Try to get cached recommendations first (less than 1 hour old)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let recommendations = await prisma.aiRecommendation.findMany({
      where: { userId: req.user!.userId, createdAt: { gte: oneHourAgo } },
      include: { job: { include: { employer: { include: { companyProfile: true } }, jobSkills: { include: { skill: true } } } } },
      orderBy: { matchScore: 'desc' },
    });

    if (recommendations.length === 0) {
      try {
        const aiResult = await aiEngineService.getJobRecommendations(req.user!.userId);
        // Refresh from DB after AI engine has saved them
        recommendations = await prisma.aiRecommendation.findMany({
          where: { userId: req.user!.userId },
          include: { job: { include: { employer: { include: { companyProfile: true } }, jobSkills: { include: { skill: true } } } } },
          orderBy: { matchScore: 'desc' },
          take: 20,
        });
      } catch (e) {
        // Return whatever we have from DB
        recommendations = await prisma.aiRecommendation.findMany({
          where: { userId: req.user!.userId },
          include: { job: { include: { employer: { include: { companyProfile: true } }, jobSkills: { include: { skill: true } } } } },
          orderBy: { matchScore: 'desc' },
          take: 20,
        });
      }
    }

    return res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('GetRecommendations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
  }
};

export const getCandidatesForJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
    if (!job || job.employerId !== req.user!.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    try {
      await aiEngineService.getCandidateRecommendations(req.params.jobId);
    } catch (e) { /* non-critical */ }

    const recommendations = await prisma.aiRecommendation.findMany({
      where: { jobId: req.params.jobId },
      include: { user: { select: { id: true, name: true, email: true, avatar: true, location: true, bio: true } } },
      orderBy: { matchScore: 'desc' },
      take: 20,
    });

    return res.json({ success: true, data: recommendations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch candidates' });
  }
};

export const getMatchDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await aiEngineService.getMatchScore(req.user!.userId, req.params.jobId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch match detail' });
  }
};

export const refreshRecommendations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check profile completeness
    const userProfile = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { userSkills: true, resumes: { where: { isActive: true } } },
    });
    if (!userProfile?.userSkills?.length && !userProfile?.resumes?.length) {
      return res.json({ success: true, data: [], message: 'PROFILE_INCOMPLETE' });
    }

    // Delete old recommendations
    await prisma.aiRecommendation.deleteMany({ where: { userId: req.user!.userId } });
    const result = await aiEngineService.getJobRecommendations(req.user!.userId);

    const recommendations = await prisma.aiRecommendation.findMany({
      where: { userId: req.user!.userId },
      include: { job: { include: { employer: { include: { companyProfile: true } }, jobSkills: { include: { skill: true } } } } },
      orderBy: { matchScore: 'desc' },
    });

    return res.json({ success: true, data: recommendations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to refresh recommendations' });
  }
};
