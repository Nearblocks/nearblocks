import { NextFunction, Request, Response } from 'express';

import config from '#config';
import logger from '#libs/logger';
import { ratelimiterRedisClient } from '#libs/ratelimiterRedis';

/**
 * Records a lightweight usage event per request to a capped Redis stream for
 * out-of-band aggregation. Fire-and-forget: never blocks the response and
 * never throws into the request path; the cap keeps it bounded.
 */
const STREAM_KEY = 'api:usage:events';

type UsageUser = { id?: number; key_id?: number };

const versionOf = (url: string): null | string => {
  const match = /^\/(v[123])(?:\/|$)/.exec(url);
  return match ? match[1] : null;
};

export const usageEvents = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Kill-switch: set USAGE_STREAM_MAXLEN=0 to disable capture entirely.
  if (config.usageStreamMaxLen <= 0) return next();

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    try {
      const user = req.user as undefined | UsageUser;
      // Normalized route pattern (e.g. /v1/blocks/:hash), not the raw URL.
      const pattern =
        (req.baseUrl || '') +
        (req.route?.path && req.route.path !== '/' ? req.route.path : '');

      const event = {
        credits: (res.locals?.usageCredits as number | undefined) ?? null,
        ip: req.ip ?? null,
        key_id: user?.key_id ?? null,
        method: req.method,
        ms: Number((process.hrtime.bigint() - start) / 1_000_000n),
        path: req.originalUrl.split('?')[0],
        route: pattern || req.path,
        status: res.statusCode,
        t: Date.now(),
        user_id: user?.id ?? null,
        version: versionOf(req.originalUrl),
      };

      void ratelimiterRedisClient
        .xadd(
          STREAM_KEY,
          'MAXLEN',
          '~',
          config.usageStreamMaxLen,
          '*',
          'd',
          JSON.stringify(event),
        )
        .catch(() => {
          // Best-effort: never surface stream errors to the request path.
        });
    } catch (error) {
      // Usage capture must never affect request handling.
      logger.error(error);
    }
  });

  next();
};
