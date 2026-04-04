import request from 'supertest';
import app from '../index';
import { createTestUser, cleanDatabase, testUser, getAuthToken, prisma } from './setup';

describe('Resume Endpoints', () => {
  let seekerToken: string;

  beforeEach(async () => {
    await cleanDatabase();
    const seeker = await createTestUser(testUser);
    seekerToken = getAuthToken(seeker.id, seeker.role);
  });

  afterAll(async () => { await cleanDatabase(); await prisma.$disconnect(); });

  describe('GET /api/resumes', () => {
    it('should list resumes for authenticated user', async () => {
      const res = await request(app).get('/api/resumes').set('Authorization', `Bearer ${seekerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/resumes');
      expect(res.status).toBe(401);
    });
  });
});
