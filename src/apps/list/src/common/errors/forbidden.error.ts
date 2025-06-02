import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums/error-code.enum';
import { AppError } from './app-error';

export class ForbiddenError extends AppError {
  constructor({ message = 'Forbidden', code }: { code?: ErrorCode; message?: string } = {}) {
    super({
      code: code || ErrorCode.Forbidden,
      message,
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}
