export abstract class AppError extends Error {
  readonly code: string;
  readonly type: string;
  readonly statusCode: number;

  constructor(params: { code: string; message: string; statusCode: number }) {
    super(params.message);

    this.code = params.code;
    this.type = this.constructor.name;
    this.message = params.message;
    this.statusCode = params.statusCode;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        type: this.type,
        message: this.message,
      },
    };
  }
}
