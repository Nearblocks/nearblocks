import { NextFunction, Request, Response } from 'express';

import config from '#config';
import { checkIPInSubnets } from '#middlewares/rateLimiter';

// Exact counts on hypertables are expensive and unreliable at scale.
// Restrict count endpoints to internal consumers only.
const internalOnly = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (config.apiAccessKey && token === config.apiAccessKey) {
    return next();
  }

  const reqIp = req.ip;
  const ipAddress =
    reqIp && reqIp.startsWith('::ffff:') ? reqIp.slice(7) : reqIp || '';

  if (checkIPInSubnets(ipAddress)) {
    return next();
  }

  return res.status(403).json({
    message: 'This endpoint is currently unavailable.',
  });
};

export default internalOnly;
