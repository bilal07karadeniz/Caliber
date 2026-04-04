import prisma from '../config/database';

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

    await this.createNotification(
      application.userId,
      'APPLICATION_UPDATE',
      `Application ${newStatus.toLowerCase()}`,
      statusMessages[newStatus] || `Application status changed to ${newStatus}`,
      { applicationId: application.id, jobId: application.jobId, status: newStatus },
    );
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
