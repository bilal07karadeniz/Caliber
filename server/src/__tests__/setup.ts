import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const testUser = {
  name: 'Test User',
  email: 'test@test.com',
  password: 'Test1234',
  role: 'JOB_SEEKER' as const,
};

export const testEmployer = {
  name: 'Test Employer',
  email: 'employer@test.com',
  password: 'Test1234',
  role: 'EMPLOYER' as const,
};

export const testAdmin = {
  name: 'Test Admin',
  email: 'testadmin@test.com',
  password: 'Admin123!',
  role: 'ADMIN' as const,
};

export const createTestUser = async (data: { name: string; email: string; password: string; role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN' } = testUser) => {
  const hashed = await bcrypt.hash(data.password, 12);
  return prisma.user.create({
    data: { name: data.name, email: data.email, password: hashed, role: data.role },
  });
};

export const getAuthToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' } as any);
};

export const cleanDatabase = async () => {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.aiRecommendation.deleteMany(),
    prisma.application.deleteMany(),
    prisma.jobSkill.deleteMany(),
    prisma.userSkill.deleteMany(),
    prisma.resume.deleteMany(),
    prisma.job.deleteMany(),
    prisma.companyProfile.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};

export { prisma };
