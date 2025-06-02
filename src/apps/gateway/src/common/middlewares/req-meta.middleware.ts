import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

export function reqMetaMiddleware(req: Request, res: Response, next: NextFunction) {
  const headers = req.headers;

  let reqId = headers['x-api-req-id'] as string;
  if (!reqId) {
    reqId = crypto.randomUUID();
    headers['x-api-req-id'] = reqId;
  }

  // Attach request metadata to request
  (req as any).reqMeta = {
    reqId,
    service: 'gateway',
    timestamp: new Date().toISOString(),
  };

  next();
}
