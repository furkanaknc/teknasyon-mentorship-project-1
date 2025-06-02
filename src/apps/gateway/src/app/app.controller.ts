import { All, Controller, Get, HttpException, HttpStatus, Logger, Param, Req, Res } from '@nestjs/common';
import { Public } from '@teknasyon/shared-auth';
import { Request, Response } from 'express';

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

  @Public()
  @All(':service/*')
  async proxyToService(@Param('service') serviceName: string, @Req() req: Request, @Res() res: Response) {
    try {
      const originalPath = req.path;
      const apiPrefixRemoved = originalPath.replace('/api', '');
      const servicePath = apiPrefixRemoved.replace(`/${serviceName}`, '') || '/';
      const targetPath = servicePath;

      this.logger.debug(`Routing ${req.method} ${originalPath} -> ${serviceName} at ${targetPath}`);

      const forwardHeaders = { ...req.headers };
      delete forwardHeaders.host;
      delete forwardHeaders.connection;
      delete forwardHeaders['content-length'];

      forwardHeaders['x-forwarded-by'] = 'gateway';
      forwardHeaders['x-original-path'] = originalPath;

      const proxyResponse = await this.proxyService
        .proxyRequest(serviceName, req.method, targetPath, req.body, forwardHeaders, req.query)
        .toPromise();

      Object.keys(proxyResponse.headers).forEach((key) => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.set(key, proxyResponse.headers[key]);
        }
      });

      res.status(proxyResponse.status).json(proxyResponse.data);
    } catch (error) {
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
  }
}
