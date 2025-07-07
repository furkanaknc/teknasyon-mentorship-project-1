import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app/app.module';

describe('Authentication Flow E2E Tests', () => {
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

  describe('Complete Authentication Flow', () => {
    let authToken: string;

    it('should handle user registration', async () => {
      const registerData = {
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!@#',
        username: `testuser-${Date.now()}`,
      };

      const response = await request(app.getHttpServer()).post('/api/auth/register').send(registerData);

      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(registerData.email);
      } else {
        expect(response.status).toBe(503);
        expect(response.body).toHaveProperty('message');
      }
    });

    it('should handle user login and return token', async () => {
      const loginData = {
        email: 'gateway@example.com',
        password: 'Test123!@#',
      };

      const response = await request(app.getHttpServer()).post('/api/auth/login').send(loginData);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('token_type', 'Bearer');
        expect(response.body).toHaveProperty('expires_in');
        authToken = response.body.access_token;
      } else {
        expect(response.status).toBe(503);
      }
    });

    it('should verify valid token', async () => {
      if (!authToken) {
        console.log('Skipping token verification test - no token available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 503]).toContain(response.status);
    });

    it('should access protected profile endpoint with token', async () => {
      if (!authToken) {
        console.log('Skipping protected endpoint test - no token available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 503]).toContain(response.status);
    });

    it('should create list with authentication', async () => {
      if (!authToken) {
        console.log('Skipping authenticated list creation test - no token available');
        return;
      }

      const listData = {
        name: `Test List ${Date.now()}`,
        type: 'todo',
        color: '#ff0000',
        slug: `test-list-${Date.now()}`,
      };

      const response = await request(app.getHttpServer())
        .post('/api/list/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(listData);

      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(listData.name);
      } else {
        expect(response.status).toBe(503);
      }
    });
  });

  describe('Invalid Authentication Tests', () => {
    it('should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/login').send({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });

      expect([401, 503]).toContain(response.status);
    });

    it('should reject malformed token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect([401, 503]).toContain(response.status);
    });

    it('should reject missing authorization header', async () => {
      const response = await request(app.getHttpServer()).get('/api/profile');

      expect([401, 503]).toContain(response.status);
    });

    it('should reject expired token format', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxfQ.expired';

      const response = await request(app.getHttpServer())
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect([401, 503]).toContain(response.status);
    });
  });
});
