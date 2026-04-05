import { Resend } from 'resend';
import prisma from '../config/database';
import { config } from '../config';

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: config.emailFrom,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send failed:', err);
  }
};

export const notificationService = {
  async createNotification(userId: string, type: any, title: string, message: string, data?: any) {
    return prisma.notification.create({
      data: { userId, type, title, message, data },
    });
  },

  async notifyApplicationStatusChange(application: any, newStatus: string) {
    const statusMessages: Record<string, string> = {
      REVIEWED: 'Your application is being reviewed',
      SHORTLISTED: 'Congratulations! You have been shortlisted',
      REJECTED: 'Your application status has been updated',
      ACCEPTED: 'Congratulations! You have been accepted',
    };

    const message = statusMessages[newStatus] || `Application status changed to ${newStatus}`;

    await this.createNotification(
      application.userId,
      'APPLICATION_UPDATE',
      `Application ${newStatus.toLowerCase()}`,
      message,
      { applicationId: application.id, jobId: application.jobId, status: newStatus },
    );

    // Send email for important status changes
    if (['SHORTLISTED', 'ACCEPTED'].includes(newStatus)) {
      const user = await prisma.user.findUnique({ where: { id: application.userId }, select: { email: true, name: true } });
      if (user?.email) {
        await sendEmail(
          user.email,
          `Application ${newStatus.toLowerCase()} — Caliber`,
          `<h2>Hi ${user.name},</h2><p>${message}</p><p>Log in to <strong>Caliber</strong> to view details.</p>`,
        );
      }
    }
  },

  async notifyNewApplicant(job: any, applicantUserId: string) {
    const applicant = await prisma.user.findUnique({ where: { id: applicantUserId }, select: { name: true } });
    await this.createNotification(
      job.employerId,
      'NEW_APPLICANT',
      'New application received',
      `${applicant?.name || 'Someone'} applied to "${job.title}"`,
      { jobId: job.id, applicantId: applicantUserId },
    );

    // Email employer
    const employer = await prisma.user.findUnique({ where: { id: job.employerId }, select: { email: true, name: true } });
    if (employer?.email) {
      await sendEmail(
        employer.email,
        `New applicant for "${job.title}" — Caliber`,
        `<h2>Hi ${employer.name},</h2><p><strong>${applicant?.name || 'A candidate'}</strong> applied to your job posting "<strong>${job.title}</strong>".</p><p>Log in to Caliber to review their application.</p>`,
      );
    }
  },

  async sendVerificationEmail(email: string, name: string, token: string) {
    const verifyUrl = `${config.clientUrl}/verify-email?token=${token}`;
    await sendEmail(email, 'Verify your email — Caliber',
      `<h2>Hi ${name},</h2><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">Verify Email</a></p><p>This link expires in 24 hours.</p>`
    );
  },

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
    await sendEmail(email, 'Reset your password — Caliber',
      `<h2>Hi ${name},</h2><p>Click below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">Reset Password</a></p><p>If you didn't request this, ignore this email.</p>`
    );
  },

  async sendEmailChangeVerification(email: string, name: string, token: string) {
    const verifyUrl = `${config.clientUrl}/verify-email-change?token=${token}`;
    await sendEmail(email, 'Confirm your new email — Caliber',
      `<h2>Hi ${name},</h2><p>You requested to change your email. Click below to confirm:</p><p><a href="${verifyUrl}">Confirm New Email</a></p><p>This link expires in 24 hours.</p>`
    );
  },

  isEmailEnabled(): boolean {
    return !!resend;
  },

  async notifyNewJobMatch(userId: string, job: any, matchScore: number) {
    await this.createNotification(
      userId,
      'NEW_JOB_MATCH',
      'New job match found!',
      `"${job.title}" matches your profile with ${Math.round(matchScore)}% compatibility`,
      { jobId: job.id, matchScore },
    );
  },
};
