import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums/error-code.enum';
import { AppError } from './app-error';

export class TooManyRequestsError extends AppError {
  constructor({ message = 'Too many requests', code }: { code?: ErrorCode; message?: string } = {}) {
    super({
      code: code || ErrorCode.TooManyRequests,
      message,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
    });
  }
}
