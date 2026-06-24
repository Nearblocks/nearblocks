import { NextFunction, Request, Response } from 'express';
import ip from 'ip';
import {
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterUnion,
} from 'rate-limiter-flexible';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import logger from '#libs/logger';
import { userSql } from '#libs/postgres';
import { ratelimiterRedisClient } from '#libs/ratelimiterRedis';
import { SubscriptionStatus } from '#types/enums';
import { Plan, User } from '#types/types';

const CUSTOM_RATE_LIMIT_MESSAGE =
  'You have exceeded your API request limit. Please try again later or upgrade your plan for higher limits at https://nearblocks.io/apis.';
const DEFAULT_PLAN: Plan = {
  id: -1,
  limit_per_day: 3666,
  limit_per_minute: 20,
  limit_per_month: 110000,
  limit_per_second: 1,
  price_annually: 0,
  price_monthly: 0,
  title: 'Default Plan',
};
const FREE_PLAN: Plan = {
  id: -1,
  limit_per_day: 333,
  limit_per_minute: 6,
  limit_per_month: 10000,
  limit_per_second: 1,
  price_annually: 0,
  price_monthly: 0,
  title: 'Free Plan',
};
const KITWALLET_PATH = '/v1/kitwallet';
const SEARCH_PATH = '/v1/search';
const SUBNETS = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'];

const rateLimiter = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = (req.user as User)?.id;
    const keyId = (req.user as User)?.key_id;
    const date = dayjs.utc().toISOString();

    const reqIp = req.ip;

    const ipAddress: string =
      reqIp && reqIp.startsWith('::ffff:') ? reqIp.slice(7) : reqIp || '';

    if (checkIPInSubnets(ipAddress)) {
      return next();
    }
    // Handle rate limit for app
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (config.apiAccessKey && token === config.apiAccessKey) {
      return next();
    }

    if (!id) {
      return await useFreePlan(req, res, next, req.ip!);
    }

    let plans: Plan[] = [];
    let selectedPlan: Plan;

    const cachedPlan = await ratelimiterRedisClient.get(`user_plan:${id}`);

    if (cachedPlan) {
      selectedPlan = JSON.parse(cachedPlan);
    } else {
      try {
        plans = await userSql<Plan[]>`
          SELECT
            p.*
          FROM
            api__plans p
            INNER JOIN api__subscriptions s ON s.plan_id = p.id
          WHERE
            s.user_id = ${id}
            AND p.type = 0
            AND s.status IN (
              ${SubscriptionStatus.ACTIVE},
              ${SubscriptionStatus.TRIALING}
            )
            AND ${date} BETWEEN s.start_date AND s.end_date
          ORDER BY
            s.end_date DESC
          LIMIT
            1
        `;

        selectedPlan = plans?.[0];

        if (selectedPlan) {
          await ratelimiterRedisClient.set(
            `user_plan:${id}`,
            JSON.stringify(selectedPlan),
            'EX',
            300, // 5m — short TTL so plan changes converge fast; invalidated on mutation
          );
        }
      } catch (error) {
        // Plan lookup errored -> free tier. A spike = DB outage, not per-customer.
        logger.error(
          error,
          `rate limit: plan lookup failed for user ${id}, applying free plan`,
        );

        return await useFreePlan(req, res, next, req.ip!);
      }
    }

    if (!selectedPlan) {
      if (keyId) {
        const tokenKey = getTokenKey(id, keyId);
        return await useFreePlan(req, res, next, id, tokenKey);
      }

      return await useFreePlan(req, res, next, id);
    }

    const baseUrl = req.baseUrl;
    const { limiters, rateLimit } = rateLimiterUnion(selectedPlan, baseUrl);

    const perPage = req?.query?.per_page || 25;
    // Validators endpoint always counts as 1 query regardless of per_page
    const consumeCount =
      baseUrl === '/validators' ? 1 : Math.ceil(+perPage / 25);
    res.locals.usageCredits = consumeCount;

    try {
      if (keyId) {
        const tokenKey = getTokenKey(id, keyId);

        if (await isLimitReached(limiters, tokenKey, consumeCount)) {
          return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
        }

        await rateLimit.consume(tokenKey, consumeCount);
      }
    } catch (error) {
      // logger.error(error);
    }

    try {
      if (await isLimitReached(limiters, id, consumeCount)) {
        return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
      }

      await rateLimit.consume(id, consumeCount);

      return next();
    } catch (error) {
      // rate-limiter-flexible rejects with a RateLimiterRes when an actual limit
      // is hit (-> 429), but with an Error on a store failure. Fail OPEN on store
      // failures so a Redis blip never blocks a paying customer — the in-memory
      // insuranceLimiter still applies a coarse per-instance cap in that case.
      if (error instanceof Error) {
        logger.error(error);
        return next();
      }

      return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
    }
  },
);

export const checkIPInSubnets = (ipAddress: string): boolean => {
  for (const subnet of SUBNETS) {
    if (ip.cidrSubnet(subnet).contains(ipAddress)) {
      return true;
    }
  }

  return false;
};

const useFreePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
  key: number | string,
  tokenKey: null | string = null,
) => {
  const baseUrl = req.baseUrl;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  const perPage = req?.query?.per_page || 25;
  // Validators endpoint always counts as 1 query regardless of per_page
  const consumeCount = baseUrl === '/validators' ? 1 : Math.ceil(+perPage / 25);
  res.locals.usageCredits = consumeCount;

  const plan = await getPlan(baseUrl, token);

  // Never cache this fallback under user_plan:${key}: for a real user id a
  // transient empty lookup would pin them to free for 24h (free_plan is cached separately).
  const { limiters, rateLimit } = rateLimiterUnion(plan, baseUrl);

  try {
    if (tokenKey) {
      if (await isLimitReached(limiters, tokenKey, consumeCount)) {
        return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
      }

      await rateLimit.consume(tokenKey, consumeCount);
    }
  } catch (error) {
    // logger.error(error);
  }

  try {
    if (await isLimitReached(limiters, key, consumeCount)) {
      return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
    }

    await rateLimit.consume(key, consumeCount);

    return next();
  } catch (error) {
    // Fail open on store failures (Error); 429 only on a real limit (RateLimiterRes).
    if (error instanceof Error) {
      logger.error(error);
      return next();
    }

    return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
  }
};

const getPlan = async (baseUrl: string, token: string) => {
  if (baseUrl === KITWALLET_PATH || baseUrl === SEARCH_PATH) {
    return DEFAULT_PLAN;
  }

  const plan = await getFreePlan();

  if (plan) {
    return plan;
  }

  if (token && isValidToken(token)) {
    return DEFAULT_PLAN;
  }

  return FREE_PLAN;
};

const getFreePlan = async () => {
  try {
    const cachedFreePlan = await ratelimiterRedisClient.get('free_plan');

    if (cachedFreePlan) {
      return JSON.parse(cachedFreePlan);
    }
    // logger.info('Free plan not found in Redis cache, fetching from DB.');

    const plans = await userSql<Plan[]>`
      SELECT
        *
      FROM
        api__plans
      WHERE
        id = 1
    `;

    const freePlan = plans?.[0];

    if (freePlan) {
      try {
        await ratelimiterRedisClient.set(
          'free_plan',
          JSON.stringify(freePlan),
          'EX',
          86400,
        );
      } catch (redisError) {
        // logger.error(redisError, 'Error caching free plan in Redis.');
      }

      return freePlan;
    }
    // logger.warn('No valid free plan found, returning null.');

    return null;
  } catch (error) {
    // logger.error(
    //   error,
    //   'Free plan not available, applying default rate limit.',
    // );

    return null;
  }
};

const isValidToken = (apiKey: string): boolean => {
  return /^[A-F0-9]{32}$/i.test(apiKey);
};

const isLimitReached = async (
  limiters: RateLimiterRedis[],
  key: number | string,
  points: number,
) => {
  const limits = await Promise.all(
    limiters.map((limiter) => limiter.get(key).catch(() => null)),
  );

  for (const limit of limits) {
    if (limit && limit.remainingPoints < points) {
      return true;
    }
  }

  return false;
};

// In-memory fallback limiters used when the rate-limiter store is unreachable
// (RateLimiterRedis `insuranceLimiter`). Cached per plan+window as module-level
// singletons so they actually accumulate across requests — recreating one per
// request would never count. They provide a coarse per-instance cap during an
// outage, so failing open is "open within reason" rather than unlimited.
const insuranceCache = new Map<string, RateLimiterMemory>();
const insurance = (key: string, points: number, duration: number) => {
  let limiter = insuranceCache.get(key);
  if (!limiter) {
    limiter = new RateLimiterMemory({ duration, points });
    insuranceCache.set(key, limiter);
  }
  return limiter;
};

const rateLimiterUnion = (plan: Plan, baseUrl: string) => {
  const pointsMinute = plan.limit_per_minute;
  const pointsDay = plan.limit_per_day;
  const pointsMonth = plan.limit_per_month;

  const minuteRateLimiter = new RateLimiterRedis({
    duration: 60, // 1 min
    insuranceLimiter: insurance(`${plan.id}_minute`, pointsMinute, 60),
    keyPrefix: `plan_${plan.id}_minute`,
    points: pointsMinute,
    storeClient: ratelimiterRedisClient,
  });
  const dayRateLimiter = new RateLimiterRedis({
    duration: 60 * 60 * 24, // 1 day
    insuranceLimiter: insurance(`${plan.id}_day`, pointsDay, 60 * 60 * 24),
    keyPrefix: `plan_${plan.id}_day`,
    points: pointsDay,
    storeClient: ratelimiterRedisClient,
  });
  const monthRateLimiter = new RateLimiterRedis({
    duration: 60 * 60 * 24 * 30, // 30 days
    insuranceLimiter: insurance(
      `${plan.id}_month`,
      pointsMonth,
      60 * 60 * 24 * 30,
    ),
    keyPrefix: `plan_${plan.id}_month`,
    points: pointsMonth,
    storeClient: ratelimiterRedisClient,
  });

  if (baseUrl === SEARCH_PATH) {
    return {
      limiters: [minuteRateLimiter, dayRateLimiter],
      rateLimit: new RateLimiterUnion(minuteRateLimiter, dayRateLimiter),
    };
  }

  return {
    limiters: [minuteRateLimiter, dayRateLimiter, monthRateLimiter],
    rateLimit: new RateLimiterUnion(
      minuteRateLimiter,
      dayRateLimiter,
      monthRateLimiter,
    ),
  };
};

const getTokenKey = (id: number, kId: number) => `${id}_${kId}`;

export default rateLimiter;
