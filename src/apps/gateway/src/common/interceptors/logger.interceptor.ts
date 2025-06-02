import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Gateway');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const { method, url, headers } = request;
    const reqId = headers['x-api-req-id'];
    const clientMeta = (request as any).clientMeta;

    this.logger.log({
      type: 'REQUEST',
      reqId,
      method,
      url,
      ip: clientMeta?.ip,
      userAgent: clientMeta?.userAgent,
      body: method !== 'GET' ? request.body : undefined,
    });

    const now = Date.now();
    return next.handle().pipe(
      tap((responseData) => {
        const responseTime = Date.now() - now;

        this.logger.log({
          type: 'RESPONSE',
          reqId,
          method,
          url,
          statusCode: response.statusCode,
          responseTime: `${responseTime}ms`,
          responseSize: JSON.stringify(responseData).length,
        });
      }),
    );
  }
}
