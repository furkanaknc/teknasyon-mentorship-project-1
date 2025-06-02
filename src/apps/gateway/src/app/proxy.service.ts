import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
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
