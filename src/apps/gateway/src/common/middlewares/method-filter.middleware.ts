import { NextFunction, Request, Response } from 'express';

export function methodFilterMiddleware(req: Request, res: Response, next: NextFunction) {
  const method = req.method;

  // Allow GET, POST, PUT, DELETE, PATCH methods
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

  if (!allowedMethods.includes(method)) {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: `Method ${method} not allowed`,
      statusCode: 405,
    });
  }

  return next();
}
