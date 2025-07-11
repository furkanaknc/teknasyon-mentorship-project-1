import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { Observable, of } from 'rxjs';
import request from 'supertest';

import { AppModule } from '../src/app/app.module';

export interface TestApp {
  app: any;
  request: any;
}

export function createMockAxiosResponse<T = any>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {},
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers,
    config: {} as any,
  };
}

export function mockServiceResponse<T = any>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {},
): Observable<AxiosResponse<T>> {
  return of(createMockAxiosResponse(data, status, headers));
}

export async function createTestApp(): Promise<TestApp> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication() as any;

  // Apply same configuration as main app
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return {
    app,
    request: request(app.getHttpServer()) as any,
  };
}

export const mockServiceResponses = {
  healthyService: {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'test-service',
  },

  loginSuccess: {
    access_token: 'mock.jwt.token',
    token_type: 'Bearer',
    expires_in: 604800000,
  },

  registerSuccess: {
    id: 'mock-user-id',
    email: 'test@example.com',
    username: 'testuser',
  },

  lists: [
    {
      id: 'list-1',
      name: 'Test List 1',
      type: 'todo',
      color: '#ff0000',
      slug: 'test-list-1',
      edit_allowed_user: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'list-2',
      name: 'Test List 2',
      type: 'shopping',
      color: '#00ff00',
      slug: 'test-list-2',
      edit_allowed_user: ['user-1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],

  listItems: [
    {
      id: 'item-1',
      listId: 'list-1',
      name: 'Test Item 1',
      description: 'Test description',
      completed: false,
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],

  profile: {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  serviceUnavailable: {
    message: 'Service test-service is unavailable',
    statusCode: 503,
    error: 'Service Unavailable',
  },

  unauthorized: {
    statusCode: 401,
    message: 'Invalid or expired token',
  },
};
