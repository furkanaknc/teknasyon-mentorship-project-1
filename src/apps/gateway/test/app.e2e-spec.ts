import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app/app.module';

describe('Gateway E2E Tests', () => {
  let app: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check Endpoints', () => {
    it('should return gateway health status with all required properties', async () => {
      const response = await request(app.getHttpServer()).get('/api/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(typeof response.body.status).toBe('string');
      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.services).toBe('object');
    });

    it('should include all required services in health check', async () => {
      const response = await request(app.getHttpServer()).get('/api/health').expect(200);

      const services = response.body.services;
      expect(services).toHaveProperty('auth');
      expect(services).toHaveProperty('list');
      expect(services).toHaveProperty('profile');

      Object.keys(services).forEach((serviceName) => {
        expect(typeof services[serviceName]).toBe('boolean');
      });
    });

    it('should return auth service health', async () => {
      const response = await request(app.getHttpServer()).get('/api/auth/health');

      expect([200, 503]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('status');
        expect(typeof response.body.status).toBe('string');
      }
    });

    it('should return list service health', async () => {
      const response = await request(app.getHttpServer()).get('/api/list/health');

      expect([200, 503]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('status');
        expect(typeof response.body.status).toBe('string');
      }
    });

    it('should return profile service health', async () => {
      const response = await request(app.getHttpServer()).get('/api/profile/health');

      expect([200, 503]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('status');
        expect(typeof response.body.status).toBe('string');
      }
    });
  });

  describe('Authentication Endpoints', () => {
    it('should handle valid login request with proper response structure', async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect([200, 503]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(typeof response.body.token).toBe('string');
        expect(typeof response.body.user).toBe('object');
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user.email).toBe('test@example.com');
      }
    });

    it('should require email and password for login', async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/login').send({});

      expect([400, 503]).toContain(response.status);

      if (response.status === 400) {
        expect(response.body).toHaveProperty('message');
        expect(Array.isArray(response.body.message) || typeof response.body.message === 'string').toBe(true);
      }
    });

    it('should handle registration with proper response structure', async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser',
      });

      expect([200, 201, 503]).toContain(response.status);

      if ([200, 201].includes(response.status)) {
        expect(response.body).toHaveProperty('user');
        expect(typeof response.body.user).toBe('object');
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).toHaveProperty('username');
        expect(response.body.user.email).toBe('newuser@example.com');
        expect(response.body.user.username).toBe('newuser');
      }
    });

    it('should handle token verification without token', async () => {
      const response = await request(app.getHttpServer()).get('/api/auth/verify');

      expect([401, 503]).toContain(response.status);

      if (response.status === 401) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });

    it('should handle token verification with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect([401, 503]).toContain(response.status);

      if (response.status === 401) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });
  });

  describe('List Management Endpoints', () => {
    it('should handle get all lists request with proper response structure', async () => {
      const response = await request(app.getHttpServer()).get('/api/list/lists');

      expect([200, 503]).toContain(response.status);

      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);

        if (response.body.length > 0) {
          const firstList = response.body[0];
          expect(firstList).toHaveProperty('id');
          expect(firstList).toHaveProperty('name');
          expect(typeof firstList.id).toBe('string');
          expect(typeof firstList.name).toBe('string');
        }
      }
    });

    it('should handle get specific list request with proper response structure', async () => {
      const testListId = 'test-list-id';
      const response = await request(app.getHttpServer()).get(`/api/list/lists/${testListId}`);

      expect([200, 404, 503]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(typeof response.body.id).toBe('string');
        expect(typeof response.body.name).toBe('string');
        expect(response.body.id).toBe(testListId);
      }

      if (response.status === 404) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });

    it('should require authentication for creating lists', async () => {
      const response = await request(app.getHttpServer()).post('/api/list/lists').send({
        name: 'Test List',
        type: 'todo',
        color: '#ff0000',
      });

      expect([401, 503]).toContain(response.status);

      if (response.status === 401) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });
  });

  describe('List Items Endpoints', () => {
    it('should handle get list items request with proper response structure', async () => {
      const testListId = 'test-list-id';
      const response = await request(app.getHttpServer()).get(`/api/list-items/${testListId}`);

      expect([200, 404, 503]).toContain(response.status);

      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);

        if (response.body.length > 0) {
          const firstItem = response.body[0];
          expect(firstItem).toHaveProperty('id');
          expect(firstItem).toHaveProperty('name');
          expect(typeof firstItem.id).toBe('string');
          expect(typeof firstItem.name).toBe('string');
        }
      }

      if (response.status === 404) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });

    it('should require authentication for creating items', async () => {
      const testListId = 'test-list-id';
      const response = await request(app.getHttpServer()).post(`/api/list-items/${testListId}`).send({
        name: 'Test Item',
        description: 'Test description',
      });

      expect([401, 503]).toContain(response.status);

      if (response.status === 401) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });
  });

  describe('Profile Endpoints', () => {
    it('should require authentication for profile access', async () => {
      const response = await request(app.getHttpServer()).get('/api/profile');

      expect([401, 503]).toContain(response.status);

      if (response.status === 401) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app.getHttpServer()).get('/api/non-existent-route').expect(404);

      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('should handle unsupported HTTP methods', async () => {
      const response = await request(app.getHttpServer()).patch('/api/health');

      expect([404, 405]).toContain(response.status);

      if (response.status === 405) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });
  });
});
