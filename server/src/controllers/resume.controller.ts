import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { config } from '../config';
import { AuthenticatedRequest } from '../types';
import { aiEngineService } from '../services/aiEngine.service';

export const uploadResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = `/uploads/resumes/${req.file.filename}`;
    let resume = await prisma.resume.create({
      data: {
        userId: req.user!.userId,
        filePath,
        fileName: req.file.originalname,
      },
    });

    // Parse resume via AI engine
    try {
      const fullPath = path.resolve(req.file.path);
      const parsed = await aiEngineService.parseResume(fullPath);

      resume = await prisma.resume.update({
        where: { id: resume.id },
        data: {
          extractedText: parsed.extracted_text,
          parsedData: parsed.parsed_data as any,
        },
      });

      // Auto-create user skills from parsed data
      if (parsed.parsed_data?.skills?.length) {
        for (const skillName of parsed.parsed_data.skills) {
          const skill = await prisma.skill.upsert({
            where: { name: skillName },
            update: {},
            create: { name: skillName },
          });
          await prisma.userSkill.upsert({
            where: { userId_skillId: { userId: req.user!.userId, skillId: skill.id } },
            update: {},
            create: { userId: req.user!.userId, skillId: skill.id, proficiencyLevel: 3 },
          });
        }
      }
    } catch (parseError) {
      console.error('Resume parsing failed (continuing without parsed data):', parseError);
    }

    return res.status(201).json({ success: true, data: resume });
  } catch (error) {
    console.error('UploadResume error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload resume' });
  }
};

export const getResumes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user!.userId },
      orderBy: { uploadedAt: 'desc' },
    });
    return res.json({ success: true, data: resumes });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch resumes' });
  }
};

export const getResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    return res.json({ success: true, data: resume });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch resume' });
  }
};

export const deleteResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    // Delete file from disk
    const fullPath = path.resolve(config.uploadDir, resume.filePath.replace('/uploads/', ''));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await prisma.resume.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete resume' });
  }
};

export const downloadResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const resume = await prisma.resume.findUnique({ where: { id: req.params.id } });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    // Allow download if owner or employer
    if (resume.userId !== req.user!.userId && req.user!.role !== 'EMPLOYER' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const fullPath = path.resolve('.' + resume.filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    return res.download(fullPath, resume.fileName);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to download resume' });
  }
};
