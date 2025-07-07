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

  describe('Authentication Service Proxy', () => {
    it('should proxy auth health check', async () => {
      const mockData = { message: 'Auth service is healthy' };

      jest.spyOn(proxyService, 'proxyRequest').mockImplementation(() => {
        return mockServiceResponse(mockData, 200, { 'content-type': 'application/json' });
      });

      const response = await request(app.getHttpServer()).get('/api/auth/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    it('should forward service error responses', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Bad Request', errors: ['Invalid input'] },
        },
      };

      jest.spyOn(proxyService, 'proxyRequest').mockImplementation(() => {
        return throwError(() => mockError);
      });

      const response = await request(app.getHttpServer()).get('/api/auth/health');

      expect(response.status).toBe(400);
      expect(response.body).toEqual(mockError.response.data);
    });
  });

  describe('List Service Proxy', () => {
    it('should proxy list creation requests', async () => {
      const mockData = { success: true };

      jest.spyOn(proxyService, 'proxyRequest').mockImplementation((serviceName, method, path, body) => {
        expect(serviceName).toBe('list');
        expect(method).toBe('POST');
        expect(path).toBe('/lists');
        expect(body).toEqual({ name: 'Test List', description: 'Test Description' });
        return mockServiceResponse(mockData, 201);
      });

      const response = await request(app.getHttpServer())
        .post('/api/list/lists')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ name: 'Test List', description: 'Test Description' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockData);
    });
  });
});
