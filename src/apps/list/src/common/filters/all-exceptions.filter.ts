import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import { ZodError } from 'zod';

import { AppError } from '../errors/app-error';
import { InternalError } from '../errors/internal.error';
import { transformHTTPException } from '../errors/transformers/http-exception.transformer';
import { transformZodError } from '../errors/transformers/zod-error.transformer';
import { UnauthorizedError } from '../errors/unauthorized.error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let appError: AppError;

    if (exception instanceof AppError) {
      appError = exception;
    } else if (exception instanceof ZodError) {
      appError = transformZodError(exception);
    } else if (exception instanceof HttpException) {
      appError = transformHTTPException(exception);
    } else if (exception instanceof Error && exception.message === 'No token provided') {
      appError = new UnauthorizedError({ message: exception.message });
    } else if (
      exception instanceof Error &&
      (exception.message.includes('jwt') || exception.message.includes('token'))
    ) {
      appError = new UnauthorizedError({ message: 'Invalid token' });
    } else {
      appError = new InternalError({
        message: exception instanceof Error ? exception.message : 'Internal server error',
      });
    }

    const errorResponse = appError.toJSON();

    this.logger.error(
      {
        error: errorResponse.error,
        statusCode: appError.statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        stack: exception instanceof Error ? exception.stack : undefined,
        body: request.body,
        query: request.query,
        params: request.params,
      },
      `${request.method} ${request.url} - ${appError.statusCode} Error`,
    );

    response.status(appError.statusCode).json(errorResponse);
  }
}
