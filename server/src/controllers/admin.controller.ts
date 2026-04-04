import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';
import { aiEngineService } from '../services/aiEngine.service';
import axios from 'axios';
import { config } from '../config';

export const getDashboardStats = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, jobSeekers, employers, admins,
      activeJobs, inactiveJobs, totalApplications,
      totalResumes, avgScore, newUsersWeek, newUsersMonth,
      applicationsByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'JOB_SEEKER' } }),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.job.count({ where: { isActive: true } }),
      prisma.job.count({ where: { isActive: false } }),
      prisma.application.count(),
      prisma.resume.count(),
      prisma.aiRecommendation.aggregate({ _avg: { matchScore: true } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.application.groupBy({ by: ['status'], _count: true }),
    ]);

    return res.json({
      success: true,
      data: {
        users: { total: totalUsers, jobSeekers, employers, admins },
        jobs: { active: activeJobs, inactive: inactiveJobs },
        applications: { total: totalApplications, byStatus: applicationsByStatus },
        resumes: totalResumes,
        aiMetrics: { averageMatchScore: avgScore._avg.matchScore || 0 },
        growth: { newUsersThisWeek: newUsersWeek, newUsersThisMonth: newUsersMonth },
      },
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

export const getSystemHealth = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    let dbStatus = 'ok';
    try { await prisma.$queryRaw`SELECT 1`; } catch { dbStatus = 'error'; }

    let aiStatus = 'ok';
    try { await axios.get(`${config.aiServiceUrl}/health`, { timeout: 5000 }); } catch { aiStatus = 'error'; }

    return res.json({
      success: true,
      data: { database: dbStatus, aiEngine: aiStatus, server: 'ok' },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Health check failed' });
  }
};

export const getUserActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [recentUsers, recentJobs, recentApplications] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, name: true, role: true, createdAt: true } }),
      prisma.job.findMany({ orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, title: true, createdAt: true } }),
      prisma.application.findMany({ orderBy: { appliedAt: 'desc' }, take: limit, include: { user: { select: { name: true } }, job: { select: { title: true } } } }),
    ]);

    return res.json({ success: true, data: { recentUsers, recentJobs, recentApplications } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch activity' });
  }
};

export const getAiMetrics = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const metrics = await aiEngineService.getAiMetrics();
    return res.json({ success: true, data: metrics });
  } catch (error) {
    // Return local metrics if AI engine is down
    const [totalRecs, avgScore] = await Promise.all([
      prisma.aiRecommendation.count(),
      prisma.aiRecommendation.aggregate({ _avg: { matchScore: true } }),
    ]);
    return res.json({
      success: true,
      data: { totalRecommendations: totalRecs, averageMatchScore: avgScore._avg.matchScore || 0 },
    });
  }
};

export const manageJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action } = req.body;
    const jobId = req.params.id;

    if (action === 'activate') {
      await prisma.job.update({ where: { id: jobId }, data: { isActive: true } });
    } else if (action === 'deactivate') {
      await prisma.job.update({ where: { id: jobId }, data: { isActive: false } });
    } else if (action === 'delete') {
      await prisma.job.delete({ where: { id: jobId } });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    return res.json({ success: true, message: `Job ${action}d successfully` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to manage job' });
  }
};
