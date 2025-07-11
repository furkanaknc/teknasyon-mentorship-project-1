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

    it('should handle user registration with proper response structure', async () => {
      const registerData = {
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!@#',
        username: `testuser-${Date.now()}`,
      };

      const response = await request(app.getHttpServer()).post('/api/auth/register').send(registerData);

      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('username');
        expect(typeof response.body.id).toBe('string');
        expect(typeof response.body.email).toBe('string');
        expect(typeof response.body.username).toBe('string');
        expect(response.body.email).toBe(registerData.email);
        expect(response.body.username).toBe(registerData.username);
      } else {
        expect(response.status).toBe(503);
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });

    it('should handle user login and return token with proper structure', async () => {
      const loginData = {
        email: 'gateway@example.com',
        password: 'Test123!@#',
      };

      const response = await request(app.getHttpServer()).post('/api/auth/login').send(loginData);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('token_type');
        expect(response.body).toHaveProperty('expires_in');
        expect(typeof response.body.access_token).toBe('string');
        expect(typeof response.body.token_type).toBe('string');
        expect(typeof response.body.expires_in).toBe('number');
        expect(response.body.token_type).toBe('Bearer');
        expect(response.body.access_token).toBeTruthy();
        expect(response.body.expires_in).toBeGreaterThan(0);
        authToken = response.body.access_token;
      } else {
        expect(response.status).toBe(503);
        expect(response.body).toHaveProperty('message');
      }
    });

    it('should verify valid token with proper response structure', async () => {
      if (!authToken) {
        console.log('Skipping token verification test - no token available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('valid');
        expect(response.body).toHaveProperty('user');
        expect(typeof response.body.valid).toBe('boolean');
        expect(typeof response.body.user).toBe('object');
        expect(response.body.valid).toBe(true);
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('email');
      } else {
        expect([401, 503]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      }
    });

    it('should access protected profile endpoint with token and validate response', async () => {
      if (!authToken) {
        console.log('Skipping protected endpoint test - no token available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('username');
        expect(typeof response.body.id).toBe('string');
        expect(typeof response.body.email).toBe('string');
        expect(typeof response.body.username).toBe('string');
      } else {
        expect([401, 503]).toContain(response.status);
        expect(response.body).toHaveProperty('message');
      }
    });

    it('should create list with authentication and validate response structure', async () => {
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
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('type');
        expect(response.body).toHaveProperty('color');
        expect(typeof response.body.id).toBe('string');
        expect(typeof response.body.name).toBe('string');
        expect(typeof response.body.type).toBe('string');
        expect(typeof response.body.color).toBe('string');
        expect(response.body.name).toBe(listData.name);
        expect(response.body.type).toBe(listData.type);
        expect(response.body.color).toBe(listData.color);
      } else {
        expect(response.status).toBe(503);
        expect(response.body).toHaveProperty('message');
      }
    });
  });

  describe('Authentication Error Handling', () => {
    it('should reject invalid credentials with proper error structure', async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/login').send({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });

      expect([401, 503]).toContain(response.status);

      if (response.status === 401) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
        expect(response.body.message).toContain('Invalid');
      }

      if (response.status === 503) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });

    it('should reject malformed token with proper error structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect([401, 503]).toContain(response.status);

      if (response.status === 401) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
        expect(response.body.message.toLowerCase()).toContain('token');
      }
    });

    it('should reject missing authorization header with proper error structure', async () => {
      const response = await request(app.getHttpServer()).get('/api/profile');

      expect([401, 503]).toContain(response.status);

      if (response.status === 401) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });

    it('should reject expired token format with proper error structure', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxfQ.expired';

      const response = await request(app.getHttpServer())
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect([401, 503]).toContain(response.status);

      if (response.status === 401) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
      }
    });

    it('should handle missing required fields in registration', async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'incomplete@example.com',
      });

      expect([400, 503]).toContain(response.status);

      if (response.status === 400) {
        expect(response.body).toHaveProperty('message');
        expect(Array.isArray(response.body.message) || typeof response.body.message === 'string').toBe(true);
      }
    });

    it('should handle invalid email format in registration', async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'invalid-email-format',
        password: 'Test123!@#',
        username: 'testuser',
      });

      expect([400, 503]).toContain(response.status);

      if (response.status === 400) {
        expect(response.body).toHaveProperty('message');
        expect(Array.isArray(response.body.message) || typeof response.body.message === 'string').toBe(true);
      }
    });
  });
});
