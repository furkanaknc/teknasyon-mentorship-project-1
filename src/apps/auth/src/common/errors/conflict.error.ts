import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums/error-code.enum';
import { AppError } from './app-error';

export class ConflictError extends AppError {
  constructor({ message = 'Conflict', code }: { code?: ErrorCode; message?: string } = {}) {
    super({
      code: code || ErrorCode.DuplicateEntry,
      message,
      statusCode: HttpStatus.CONFLICT,
    });
  }
}
