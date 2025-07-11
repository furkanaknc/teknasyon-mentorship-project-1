process.env.JWT_SECRET = 'cat-secret-key-for-tests';

import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { throwError } from 'rxjs';
import request from 'supertest';

import { AppModule } from '../src/app/app.module';
import { ProxyService } from '../src/app/proxy.service';
import { mockServiceResponse } from './test-utils';

describe('Service Proxy E2E Tests', () => {
  let app: any;
  let proxyService: ProxyService;

  const jwtSecret = 'cat-secret-key-for-tests';
  const testToken = jwt.sign({ sub: 'test-user-id', email: 'test@example.com' }, jwtSecret, { expiresIn: '1h' });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    proxyService = moduleFixture.get<ProxyService>(ProxyService);
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Proxy Service Health and Error Handling', () => {
    it('should proxy auth health check with proper response structure', async () => {
      const mockData = {
        status: 'ok',
        service: 'auth',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };

      jest.spyOn(proxyService, 'proxyRequest').mockImplementation(() => {
        return mockServiceResponse(mockData, 200, { 'content-type': 'application/json' });
      });

      const response = await request(app.getHttpServer()).get('/api/auth/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.status).toBe('string');
      expect(typeof response.body.service).toBe('string');
      expect(typeof response.body.timestamp).toBe('string');
      expect(response.body.service).toBe('auth');
    });

    it('should forward service error responses with proper error structure', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Bad Request',
            errors: ['Invalid input'],
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
        },
      };

      jest.spyOn(proxyService, 'proxyRequest').mockImplementation(() => {
        return throwError(() => mockError);
      });

      const response = await request(app.getHttpServer()).get('/api/auth/health');

      expect(response.status).toBe(400);
      expect(response.body).toEqual(mockError.response.data);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
      expect(response.body).toHaveProperty('statusCode');
      expect(typeof response.body.message).toBe('string');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(typeof response.body.statusCode).toBe('number');
      expect(response.body.statusCode).toBe(400);
    });

    it('should handle service timeout errors properly', async () => {
      const mockError = {
        response: {
          status: 503,
          data: {
            message: 'Service Unavailable',
            statusCode: 503,
            error: 'Service Timeout',
          },
        },
      };

      jest.spyOn(proxyService, 'proxyRequest').mockImplementation(() => {
        return throwError(() => mockError);
      });

      const response = await request(app.getHttpServer()).get('/api/list/health');

      expect(response.status).toBe(503);
      expect(response.body).toEqual(mockError.response.data);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.statusCode).toBe(503);
    });
  });

  describe('Authenticated Proxy Operations', () => {
    it('should proxy list creation requests with proper response structure', async () => {
      const requestData = { name: 'Test List', description: 'Test Description', type: 'todo' };
      const mockData = {
        id: 'list-123',
        name: 'Test List',
        description: 'Test Description',
        type: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'test-user-id',
      };

      jest.spyOn(proxyService, 'proxyRequest').mockImplementation((serviceName, method, path, body) => {
        expect(serviceName).toBe('list');
        expect(method).toBe('POST');
        expect(path).toBe('/lists');
        expect(body).toEqual(requestData);
        expect(typeof serviceName).toBe('string');
        expect(typeof method).toBe('string');
        expect(typeof path).toBe('string');
        expect(typeof body).toBe('object');
        return mockServiceResponse(mockData, 201);
      });

      const response = await request(app.getHttpServer())
        .post('/api/list/lists')
        .set('Authorization', `Bearer ${testToken}`)
        .send(requestData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockData);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('userId');
      expect(typeof response.body.id).toBe('string');
      expect(typeof response.body.name).toBe('string');
      expect(typeof response.body.description).toBe('string');
      expect(typeof response.body.type).toBe('string');
      expect(typeof response.body.createdAt).toBe('string');
      expect(typeof response.body.userId).toBe('string');
      expect(response.body.name).toBe(requestData.name);
      expect(response.body.description).toBe(requestData.description);
      expect(response.body.type).toBe(requestData.type);
    });

    it('should handle authentication failures in proxy requests', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            message: 'Invalid or expired token',
            statusCode: 401,
          },
        },
      };

      jest.spyOn(proxyService, 'proxyRequest').mockImplementation(() => {
        return throwError(() => mockError);
      });

      const response = await request(app.getHttpServer())
        .post('/api/list/lists')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Test List', description: 'Test Description' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual(mockError.response.data);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.statusCode).toBe(401);
    });

    it('should proxy profile requests with proper response structure', async () => {
      const mockData = {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jest.spyOn(proxyService, 'proxyRequest').mockImplementation((serviceName, method, path) => {
        expect(serviceName).toBe('profile');
        expect(method).toBe('GET');
        expect(path).toBe('/profile');
        return mockServiceResponse(mockData, 200);
      });

      const response = await request(app.getHttpServer())
        .get('/api/profile')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('username');
      expect(typeof response.body.id).toBe('string');
      expect(typeof response.body.email).toBe('string');
      expect(typeof response.body.username).toBe('string');
      expect(response.body.id).toBe('test-user-id');
      expect(response.body.email).toBe('test@example.com');
    });
  });
});
