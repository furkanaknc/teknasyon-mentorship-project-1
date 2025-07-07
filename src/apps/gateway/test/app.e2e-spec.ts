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

  describe('/api/health (GET)', () => {
    it('should return gateway health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('services');
          expect(typeof res.body.services).toBe('object');
        });
    });

    it('should include all required services in health check', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          const services = res.body.services;
          expect(services).toHaveProperty('auth');
          expect(services).toHaveProperty('list');
          expect(services).toHaveProperty('profile');
        });
    });
  });

  describe('/api/auth (Auth Controller)', () => {
    describe('POST /api/auth/login', () => {
      it('should handle login request', () => {
        return request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123',
          })
          .expect((res) => {
            expect([200, 503]).toContain(res.status);
          });
      });

      it('should require email and password', () => {
        return request(app.getHttpServer())
          .post('/api/auth/login')
          .send({})
          .expect((res) => {
            expect([400, 503]).toContain(res.status);
          });
      });
    });

    describe('POST /api/auth/register', () => {
      it('should handle register request', () => {
        return request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            email: 'newuser@example.com',
            password: 'password123',
            username: 'newuser',
          })
          .expect((res) => {
            expect([200, 201, 503]).toContain(res.status);
          });
      });
    });

    describe('GET /api/auth/health', () => {
      it('should return auth service health', () => {
        return request(app.getHttpServer())
          .get('/api/auth/health')
          .expect((res) => {
            expect([200, 503]).toContain(res.status);
          });
      });
    });

    describe('GET /api/auth/verify', () => {
      it('should handle token verification without token', () => {
        return request(app.getHttpServer())
          .get('/api/auth/verify')
          .expect((res) => {
            expect([401, 503]).toContain(res.status);
          });
      });

      it('should handle token verification with invalid token', () => {
        return request(app.getHttpServer())
          .get('/api/auth/verify')
          .set('Authorization', 'Bearer invalid-token')
          .expect((res) => {
            expect([401, 503]).toContain(res.status);
          });
      });
    });
  });

  describe('/api/list (List Controller)', () => {
    describe('GET /api/list/lists', () => {
      it('should handle get all lists request', () => {
        return request(app.getHttpServer())
          .get('/api/list/lists')
          .expect((res) => {
            expect([200, 503]).toContain(res.status);
            if (res.status === 200) {
              expect(Array.isArray(res.body)).toBe(true);
            }
          });
      });
    });

    describe('GET /api/list/lists/:listId', () => {
      it('should handle get specific list request', () => {
        const testListId = 'test-list-id';
        return request(app.getHttpServer())
          .get(`/api/list/lists/${testListId}`)
          .expect((res) => {
            expect([200, 404, 503]).toContain(res.status);
          });
      });
    });

    describe('POST /api/list/lists', () => {
      it('should require authentication for creating lists', () => {
        return request(app.getHttpServer())
          .post('/api/list/lists')
          .send({
            name: 'Test List',
            type: 'todo',
            color: '#ff0000',
          })
          .expect((res) => {
            expect([401, 503]).toContain(res.status);
          });
      });
    });

    describe('GET /api/list/health', () => {
      it('should return list service health', () => {
        return request(app.getHttpServer())
          .get('/api/list/health')
          .expect((res) => {
            // Should either return health status or service unavailable
            expect([200, 503]).toContain(res.status);
          });
      });
    });
  });

  describe('/api/list-items (List Items Controller)', () => {
    describe('GET /api/list-items/:listId', () => {
      it('should handle get list items request', () => {
        const testListId = 'test-list-id';
        return request(app.getHttpServer())
          .get(`/api/list-items/${testListId}`)
          .expect((res) => {
            // Should either return items, not found, or service unavailable
            expect([200, 404, 503]).toContain(res.status);
          });
      });
    });

    describe('POST /api/list-items/:listId', () => {
      it('should require authentication for creating items', () => {
        const testListId = 'test-list-id';
        return request(app.getHttpServer())
          .post(`/api/list-items/${testListId}`)
          .send({
            name: 'Test Item',
            description: 'Test description',
          })
          .expect((res) => {
            expect([401, 503]).toContain(res.status);
          });
      });
    });
  });

  describe('/api/profile (Profile Controller)', () => {
    describe('GET /api/profile', () => {
      it('should require authentication for profile access', () => {
        return request(app.getHttpServer())
          .get('/api/profile')
          .expect((res) => {
            expect([401, 503]).toContain(res.status);
          });
      });
    });

    describe('GET /api/profile/health', () => {
      it('should return profile service health', () => {
        return request(app.getHttpServer())
          .get('/api/profile/health')
          .expect((res) => {
            expect([200, 503]).toContain(res.status);
          });
      });
    });
  });

  describe('Route not found', () => {
    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer()).get('/api/non-existent-route').expect(404);
    });
  });

  describe('HTTP Methods', () => {
    it('should handle unsupported HTTP methods', () => {
      return request(app.getHttpServer())
        .patch('/api/health')
        .expect((res) => {
          expect([404, 405]).toContain(res.status);
        });
    });
  });
});
