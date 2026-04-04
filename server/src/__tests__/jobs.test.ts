import request from 'supertest';
import app from '../index';
import { createTestUser, cleanDatabase, testEmployer, testUser, getAuthToken, prisma } from './setup';

describe('Job Endpoints', () => {
  let employerToken: string;
  let seekerToken: string;

  beforeEach(async () => {
    await cleanDatabase();
    const employer = await createTestUser(testEmployer);
    await prisma.companyProfile.create({ data: { userId: employer.id, companyName: 'TestCo' } });
    const seeker = await createTestUser(testUser);
    employerToken = getAuthToken(employer.id, employer.role);
    seekerToken = getAuthToken(seeker.id, seeker.role);
  });

  afterAll(async () => { await cleanDatabase(); await prisma.$disconnect(); });

  describe('POST /api/jobs', () => {
    it('should create a job as employer', async () => {
      const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${employerToken}`)
        .send({ title: 'Test Job', description: 'A test job description here', requirements: 'Test requirements description', location: 'Istanbul', employmentType: 'FULL_TIME' });
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Test Job');
    });

    it('should reject job creation by seeker', async () => {
      const res = await request(app).post('/api/jobs').set('Authorization', `Bearer ${seekerToken}`)
        .send({ title: 'Test', description: 'Description text', requirements: 'Requirements text', location: 'Istanbul', employmentType: 'FULL_TIME' });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/jobs', () => {
    it('should list jobs publicly', async () => {
      const res = await request(app).get('/api/jobs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
