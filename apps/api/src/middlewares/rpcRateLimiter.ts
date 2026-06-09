import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';

import config from '#config';
import catchAsync from '#libs/async';
import logger from '#libs/logger';
import { ratelimiterRedisClient } from '#libs/ratelimiterRedis';
import { extractRpcId, jsonRpcError, RPC_ERROR_CODE } from '#libs/rpc';
import { checkIPInSubnets } from '#middlewares/rateLimiter';

// Dedicated per-IP limiter for the anonymous JSON-RPC proxy, intentionally
// SEPARATE from the API plan limiter. Browser RPC traffic is anonymous (no
// req.user), so the shared limiter would drop it onto the 6 req/min FREE_PLAN
// path and 429 a normal explorer pageview, which fans out into many view calls.
// This gives /rpc its own generous per-IP budget on the same redis store, fails
// OPEN on a store outage so a redis blip never blocks browsing, and returns a
// JSON-RPC-shaped 429 the client can parse. Real abuse is gated by Turnstile
// (Phase 2); this is only a coarse anti-scraper backstop.
const insuranceLimiter = new RateLimiterMemory({
  duration: config.rpcRateLimitDuration,
  points: config.rpcRateLimitPoints,
});

const limiter = new RateLimiterRedis({
  duration: config.rpcRateLimitDuration,
  insuranceLimiter,
  keyPrefix: 'rpc_ip',
  points: config.rpcRateLimitPoints,
  storeClient: ratelimiterRedisClient,
});

const clientIp = (req: Request): string => {
  const reqIp = req.ip ?? '';
  return reqIp.startsWith('::ffff:') ? reqIp.slice(7) : reqIp;
};

const rpcRateLimiter = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ipAddress = clientIp(req);

    // Internal/cluster traffic (and unresolved IPs) bypass the limit.
    if (!ipAddress || checkIPInSubnets(ipAddress)) {
      return next();
    }

    // First-party server-side callers carrying the internal access key bypass.
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (config.apiAccessKey && token === config.apiAccessKey) {
      return next();
    }

    try {
      await limiter.consume(ipAddress);

      return next();
    } catch (error) {
      // rate-limiter-flexible rejects with a RateLimiterRes on a real limit
      // (-> 429) but with an Error on a store failure. Fail OPEN on store
      // failures so a redis blip never blocks legitimate browsing.
      if (error instanceof Error) {
        logger.error(error, 'rpc rate limit: store failure, failing open');

        return next();
      }

      return res
        .status(429)
        .json(
          jsonRpcError(
            extractRpcId(req.body),
            RPC_ERROR_CODE.RATE_LIMITED,
            'Rate limit exceeded',
          ),
        );
    }
  },
);

export default rpcRateLimiter;
