import { Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';
import { comparePassword } from '../utils/password';
import { sanitizeUser } from '../utils/sanitizeUser';

export const exportUserData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const [user, applications, resumes, recommendations, userSkills, notifications] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, include: { companyProfile: true } }),
      prisma.application.findMany({ where: { userId }, include: { job: { select: { title: true } } } }),
      prisma.resume.findMany({ where: { userId }, select: { id: true, fileName: true, uploadedAt: true, parsedData: true } }),
      prisma.aiRecommendation.findMany({ where: { userId }, include: { job: { select: { title: true } } } }),
      prisma.userSkill.findMany({ where: { userId }, include: { skill: true } }),
      prisma.notification.findMany({ where: { userId } }),
    ]);

    const exportData = {
      profile: sanitizeUser(user),
      applications,
      resumes,
      recommendations,
      skills: userSkills,
      notifications,
      exportedAt: new Date().toISOString(),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=user-data-${userId}.json`);
    return res.json({ success: true, data: exportData });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to export data' });
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid password' });

    await prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { userId: user.id } });
      await tx.aiRecommendation.deleteMany({ where: { userId: user.id } });
      await tx.application.deleteMany({ where: { userId: user.id } });
      await tx.userSkill.deleteMany({ where: { userId: user.id } });
      await tx.resume.deleteMany({ where: { userId: user.id } });
      if (user.role === 'EMPLOYER') {
        await tx.companyProfile.deleteMany({ where: { userId: user.id } });
      }
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: 'Deleted User',
          email: `deleted-${user.id}@deleted.com`,
          phone: null, location: null, bio: null, avatar: null,
          isActive: false,
        },
      });
    });

    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
};
