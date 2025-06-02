import { HttpStatus } from "@nestjs/common";
import { AppError } from "./app-error";

export class UnauthorizedError extends AppError {
  constructor({
    message = "Access denied",
    code = "unauthorized",
  }: { code?: string; message?: string } = {}) {
    super({
      code,
      message,
      statusCode: HttpStatus.UNAUTHORIZED,
    });
  }
}
