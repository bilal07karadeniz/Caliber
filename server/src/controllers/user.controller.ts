import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';
import { sanitizeUser } from '../utils/sanitizeUser';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken, hashToken } from '../utils/verificationToken';
import { notificationService } from '../services/notification.service';
import { config } from '../config';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id || req.user?.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userSkills: { include: { skill: true } },
        resumes: { where: { isActive: true }, orderBy: { uploadedAt: 'desc' } },
        companyProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error('GetProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone, location, bio } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(bio !== undefined && { bio }),
      },
    });

    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const updateSkills = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { skills } = req.body;
    const userId = req.user!.userId;

    await prisma.$transaction(async (tx) => {
      await tx.userSkill.deleteMany({ where: { userId } });

      for (const s of skills) {
        const skill = await tx.skill.upsert({
          where: { name: s.skillName },
          update: {},
          create: { name: s.skillName, category: s.category || null },
        });

        await tx.userSkill.create({
          data: { userId, skillId: skill.id, proficiencyLevel: s.proficiencyLevel },
        });
      }
    });

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    return res.json({ success: true, data: userSkills });
  } catch (error) {
    console.error('UpdateSkills error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update skills' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const isActive = req.query.isActive;

    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { companyProfile: true },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        data: users.map(sanitizeUser),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const toggleUserActive = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
    });

    return res.json({ success: true, data: sanitizeUser(updated) });
  } catch (error) {
    console.error('ToggleActive error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle user status' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

export const changeEmail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newEmail, password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(400).json({ success: false, message: 'Password is incorrect' });

    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already taken' });

    if (notificationService.isEmailEnabled()) {
      await prisma.verificationToken.deleteMany({ where: { userId: user.id, type: 'EMAIL_CHANGE' } });
      const token = generateToken();
      await prisma.verificationToken.create({
        data: { userId: user.id, token: hashToken(token), type: 'EMAIL_CHANGE', expiresAt: new Date(Date.now() + config.verificationTokenExpiry), data: { newEmail } },
      });
      await notificationService.sendEmailChangeVerification(newEmail, user.name, token);
      return res.json({ success: true, message: 'Verification email sent to your new address' });
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });
      return res.json({ success: true, message: 'Email changed successfully' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to change email' });
  }
};

export const uploadAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatar: avatarPath },
    });

    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error('UploadAvatar error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
};
