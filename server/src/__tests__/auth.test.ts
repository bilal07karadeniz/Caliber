import request from 'supertest';
import app from '../index';
import { createTestUser, cleanDatabase, testUser, getAuthToken, prisma } from './setup';

describe('Auth Endpoints', () => {
  beforeEach(async () => { await cleanDatabase(); });
  afterAll(async () => { await cleanDatabase(); await prisma.$disconnect(); });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      await createTestUser();
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(409);
    });

    it('should reject invalid data', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'bad' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser();
      const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
      await createTestUser();
      const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: 'Wrong123' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user with valid token', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user.id, user.role);
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('should reject without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
