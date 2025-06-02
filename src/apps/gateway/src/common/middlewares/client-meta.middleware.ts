import { NextFunction, Request, Response } from 'express';

export function clientMetaMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Attach client metadata to request
  (req as any).clientMeta = {
    ip: Array.isArray(ip) ? ip[0] : ip,
    userAgent,
  };

  next();
}
