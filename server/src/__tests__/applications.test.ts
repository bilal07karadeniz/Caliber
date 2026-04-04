import request from 'supertest';
import app from '../index';
import { createTestUser, cleanDatabase, testEmployer, testUser, getAuthToken, prisma } from './setup';

describe('Application Endpoints', () => {
  let seekerToken: string;
  let seekerId: string;
  let jobId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const employer = await createTestUser(testEmployer);
    const seeker = await createTestUser(testUser);
    seekerId = seeker.id;
    seekerToken = getAuthToken(seeker.id, seeker.role);

    const job = await prisma.job.create({
      data: { employerId: employer.id, title: 'Test Job', description: 'Desc', requirements: 'Reqs', location: 'Istanbul', employmentType: 'FULL_TIME' },
    });
    jobId = job.id;
  });

  afterAll(async () => { await cleanDatabase(); await prisma.$disconnect(); });

  describe('POST /api/applications', () => {
    it('should apply to a job', async () => {
      const res = await request(app).post('/api/applications').set('Authorization', `Bearer ${seekerToken}`)
        .send({ jobId });
      expect(res.status).toBe(201);
    });

    it('should reject duplicate application', async () => {
      await request(app).post('/api/applications').set('Authorization', `Bearer ${seekerToken}`).send({ jobId });
      const res = await request(app).post('/api/applications').set('Authorization', `Bearer ${seekerToken}`).send({ jobId });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/applications/my', () => {
    it('should list my applications', async () => {
      const res = await request(app).get('/api/applications/my').set('Authorization', `Bearer ${seekerToken}`);
      expect(res.status).toBe(200);
    });
  });
});
