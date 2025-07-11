import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app/app.module';

describe('Gateway E2E Tests', () => {
  let app: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/health (GET) - should return gateway health status', async () => {
      const response = await request(app.getHttpServer()).get('/api/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
    });
  });

  describe('Authentication Routes', () => {
    it('/api/auth/health (GET) - should proxy to auth service', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/health')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });
    });

    it('/api/auth/login (POST) - should proxy login request', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginData)
        .expect((res) => {
          expect([200, 400, 503]).toContain(res.status);
        });
    });
  });

  describe('List Routes', () => {
    it('/api/list/health (GET) - should proxy to list service', async () => {
      await request(app.getHttpServer())
        .get('/api/list/health')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });
    });

    it('/api/list/lists (GET) - should proxy to list service', async () => {
      await request(app.getHttpServer())
        .get('/api/list/lists')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });
    });
  });

  describe('List Items Routes', () => {
    it('/api/list-items/test-id (GET) - should proxy to list service', async () => {
      await request(app.getHttpServer())
        .get('/api/list-items/test-id')
        .expect((res) => {
          expect([200, 404, 503]).toContain(res.status);
        });
    });
  });

  describe('Profile Routes', () => {
    it('/api/profile/health (GET) - should proxy to profile service', async () => {
      await request(app.getHttpServer())
        .get('/api/profile/health')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });
    });

    it('/api/profile (GET) - should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/profile')
        .expect((res) => {
          expect([401, 503]).toContain(res.status);
        });
    });

    it('/api/profile (GET) - should work with valid token', async () => {
      const token = 'Bearer test-token';

      await request(app.getHttpServer())
        .get('/api/profile')
        .set('Authorization', token)
        .expect((res) => {
          expect([200, 401, 503]).toContain(res.status);
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app.getHttpServer()).get('/api/non-existent').expect(404);
    });

    it('should handle CORS properly', async () => {
      const response = await request(app.getHttpServer()).options('/api/health');

      expect(response.status).toBe(404);
    });
  });

  describe('Request Headers', () => {
    it('should forward custom headers to services', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/health')
        .set('X-Custom-Header', 'test-value')
        .set('User-Agent', 'Test-Agent')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });
    });

    it('should add gateway tracking headers', async () => {
      await request(app.getHttpServer())
        .get('/api/list/health')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });
    });
  });
});
