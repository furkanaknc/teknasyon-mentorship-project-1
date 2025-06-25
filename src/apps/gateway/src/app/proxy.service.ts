import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { catchError, map, Observable, timeout } from 'rxjs';

export interface ServiceConfig {
  name: string;
  url: string;
  healthEndpoint?: string;
  timeout?: number;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly services: Map<string, ServiceConfig> = new Map();

  constructor(private readonly httpService: HttpService) {
    this.initializeServices();
  }

  private initializeServices() {
    const services: ServiceConfig[] = [
      {
        name: 'auth',
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        healthEndpoint: '/health',
        timeout: 5000,
      },
      {
        name: 'list',
        url: process.env.LIST_SERVICE_URL || 'http://localhost:3002',
        healthEndpoint: '/health',
        timeout: 5000,
      },
      {
        name: 'profile',
        url: process.env.PROFILE_SERVICE_URL || 'http://localhost:3003',
        healthEndpoint: '/health',
        timeout: 5000,
      },
    ];

    services.forEach((service) => {
      this.services.set(service.name, service);
      this.logger.log(`Registered service: ${service.name} at ${service.url}`);
    });
  }

  getServiceUrl(serviceName: string): string | null {
    const service = this.services.get(serviceName);
    return service ? service.url : null;
  }

  proxyRequest(
    serviceName: string,
    method: string,
    path: string,
    data?: any,
    headers?: any,
    params?: any,
  ): Observable<AxiosResponse> {
    const service = this.services.get(serviceName);

    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const url = `${service.url}${path}`;
    const requestTimeout = service.timeout || 5000;

    this.logger.debug(`Proxying ${method.toUpperCase()} request to: ${url}`);

    const requestConfig = {
      method: method.toLowerCase(),
      url,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      params,
      ...(data && { data }),
    };

    return this.httpService.request(requestConfig).pipe(
      timeout(requestTimeout),
      map((response) => response),
      catchError((error) => {
        this.logger.error(`Error proxying request to ${serviceName}:`, error.message);
        throw error;
      }),
    );
  }

  async proxyToService(
    serviceName: string,
    method: string,
    path: string,
    body: any,
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const forwardHeaders = { ...req.headers };
      delete forwardHeaders.host;
      delete forwardHeaders.connection;
      delete forwardHeaders['content-length'];

      forwardHeaders['x-forwarded-by'] = 'gateway';
      forwardHeaders['x-original-path'] = req.path;

      this.logger.debug(`Proxying ${method} ${req.path} -> ${serviceName} service at ${path}`);

      const proxyResponse = await this.proxyRequest(
        serviceName,
        method,
        path,
        body,
        forwardHeaders,
        req.query,
      ).toPromise();

      // Forward response headers
      Object.keys(proxyResponse.headers).forEach((key) => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.set(key, proxyResponse.headers[key]);
        }
      });

      res.status(proxyResponse.status).json(proxyResponse.data);
    } catch (error) {
      this.handleProxyError(error, serviceName, res);
    }
  }

  private handleProxyError(error: any, serviceName: string, res: Response): void {
    this.logger.error(`Error proxying to ${serviceName}:`, error.response?.data || error.message);

    if (error.response) {
      const statusCode = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const errorData = error.response.data || {
        message: 'Service error',
        statusCode,
      };
      res.status(statusCode).json(errorData);
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message: `Service ${serviceName} is unavailable`,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'Service Unavailable',
      });
    } else if (error.name === 'TimeoutError') {
      res.status(HttpStatus.REQUEST_TIMEOUT).json({
        message: `Request to ${serviceName} timed out`,
        statusCode: HttpStatus.REQUEST_TIMEOUT,
        error: 'Request Timeout',
      });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal gateway error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
      });
    }
  }

  async healthCheck(serviceName?: string): Promise<Record<string, boolean>> {
    const servicesToCheck = serviceName ? [serviceName] : Array.from(this.services.keys());

    const healthResults: Record<string, boolean> = {};

    for (const name of servicesToCheck) {
      const service = this.services.get(name);
      if (!service) {
        healthResults[name] = false;
        continue;
      }

      try {
        const healthUrl = `${service.url}${service.healthEndpoint || '/health'}`;
        const response = await this.httpService
          .get(healthUrl, {
            timeout: 3000,
          })
          .toPromise();

        healthResults[name] = response?.status === 200;
      } catch (error) {
        this.logger.warn(`Health check failed for ${name}:`, error.message);
        healthResults[name] = false;
      }
    }

    return healthResults;
  }
}
