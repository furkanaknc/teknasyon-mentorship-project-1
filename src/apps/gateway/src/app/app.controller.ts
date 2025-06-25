import { Controller, Get, HttpException, HttpStatus, Logger, Param } from '@nestjs/common';
import { Public } from '@teknasyon/shared-auth';

import { ProxyService } from './proxy.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @Get('health')
  async healthCheck() {
    try {
      const healthResults = await this.proxyService.healthCheck();
      const allHealthy = Object.values(healthResults).every((status) => status);

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: healthResults,
      };
    } catch (error) {
      this.logger.error('Health check failed:', error.message);
      throw new HttpException(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Public()
  @Get('health/:service')
  async serviceHealthCheck(@Param('service') serviceName: string) {
    try {
      const healthResults = await this.proxyService.healthCheck(serviceName);
      const isHealthy = healthResults[serviceName];

      if (isHealthy === undefined) {
        throw new HttpException(`Service ${serviceName} not found`, HttpStatus.NOT_FOUND);
      }

      return {
        service: serviceName,
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Health check failed for ${serviceName}:`, error.message);
      throw new HttpException(
        {
          service: serviceName,
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
