import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';
import { sanitizeUser } from '../utils/sanitizeUser';
import { generateToken, hashToken, generateOTP } from '../utils/verificationToken';
import { notificationService } from '../services/notification.service';
import { config } from '../config';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    if (role === 'EMPLOYER') {
      await prisma.companyProfile.create({
        data: { userId: user.id, companyName: name + "'s Company" },
      });
    }

    if (notificationService.isEmailEnabled()) {
      const token = generateToken();
      await prisma.verificationToken.create({
        data: {
          userId: user.id,
          token: hashToken(token),
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(Date.now() + config.verificationTokenExpiry),
        },
      });
      await notificationService.sendVerificationEmail(user.email, user.name, token);
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      data: { user: sanitizeUser(user), accessToken },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in', emailVerified: false });
    }

    if (notificationService.isEmailEnabled()) {
      await prisma.verificationToken.deleteMany({
        where: { userId: user.id, type: 'EMAIL_VERIFICATION', data: { path: ['purpose'], equals: 'login' } },
      });
      const code = generateOTP();
      await prisma.verificationToken.create({
        data: {
          userId: user.id,
          token: hashToken(code),
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(Date.now() + config.otpExpiry),
          data: { purpose: 'login' },
        },
      });
      await notificationService.sendOTPEmail(user.email, user.name, code, 'login');
      return res.json({ success: true, message: 'Verification code sent to your email', requiresOTP: true, userId: user.id });
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      data: { user: sanitizeUser(user), accessToken },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const verifyLoginOTP = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;
    const hashedCode = hashToken(code);

    const token = await prisma.verificationToken.findFirst({
      where: { userId, token: hashedCode, type: 'EMAIL_VERIFICATION', expiresAt: { gt: new Date() } },
    });

    if (!token || !(token.data as any)?.purpose) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    const purpose = (token.data as any).purpose;
    await prisma.verificationToken.delete({ where: { id: token.id } });

    if (purpose === 'login') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { userSkills: { include: { skill: true } }, companyProfile: true },
      });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const accessToken = generateAccessToken({ userId: user.id, role: user.role as any });
      const refreshToken = generateRefreshToken({ userId: user.id });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { password: _, ...userWithoutPassword } = user;
      return res.json({ success: true, data: { user: userWithoutPassword, accessToken } });
    }

    return res.json({ success: true, message: 'Code verified' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, data: { accessToken, user: sanitizeUser(user) } });
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  return res.json({ success: true, message: 'Logged out' });
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const hashedToken = hashToken(token);

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token: hashedToken, type: 'EMAIL_VERIFICATION', expiresAt: { gt: new Date() } },
    });

    if (!verificationToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    await prisma.user.update({ where: { id: verificationToken.userId }, data: { emailVerified: true } });
    await prisma.verificationToken.deleteMany({ where: { userId: verificationToken.userId, type: 'EMAIL_VERIFICATION' } });

    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerified && notificationService.isEmailEnabled()) {
      await prisma.verificationToken.deleteMany({ where: { userId: user.id, type: 'EMAIL_VERIFICATION' } });
      const token = generateToken();
      await prisma.verificationToken.create({
        data: { userId: user.id, token: hashToken(token), type: 'EMAIL_VERIFICATION', expiresAt: new Date(Date.now() + config.verificationTokenExpiry) },
      });
      await notificationService.sendVerificationEmail(user.email, user.name, token);
    }

    return res.json({ success: true, message: 'If that email exists and is unverified, we sent a verification link' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to resend verification' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && notificationService.isEmailEnabled()) {
      await prisma.verificationToken.deleteMany({ where: { userId: user.id, type: 'PASSWORD_RESET' } });
      const token = generateToken();
      await prisma.verificationToken.create({
        data: { userId: user.id, token: hashToken(token), type: 'PASSWORD_RESET', expiresAt: new Date(Date.now() + config.passwordResetTokenExpiry) },
      });
      await notificationService.sendPasswordResetEmail(user.email, user.name, token);
    }

    return res.json({ success: true, message: 'If that email exists, we sent a password reset link' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to process request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const hashedToken = hashToken(token);

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token: hashedToken, type: 'PASSWORD_RESET', expiresAt: { gt: new Date() } },
    });

    if (!verificationToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.update({ where: { id: verificationToken.userId }, data: { password: hashedPassword } });
    await prisma.verificationToken.deleteMany({ where: { userId: verificationToken.userId, type: 'PASSWORD_RESET' } });

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

export const verifyEmailChange = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const hashedToken = hashToken(token);

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token: hashedToken, type: 'EMAIL_CHANGE', expiresAt: { gt: new Date() } },
    });

    if (!verificationToken || !verificationToken.data) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const { newEmail } = verificationToken.data as any;
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already taken' });
    }

    await prisma.user.update({ where: { id: verificationToken.userId }, data: { email: newEmail, emailVerified: true } });
    await prisma.verificationToken.deleteMany({ where: { userId: verificationToken.userId, type: 'EMAIL_CHANGE' } });

    return res.json({ success: true, message: 'Email changed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to change email' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        userSkills: { include: { skill: true } },
        companyProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};
