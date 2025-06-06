import { NextFunction, Request, Response } from 'express';
import ip from 'ip';
import { RateLimiterRedis, RateLimiterUnion } from 'rate-limiter-flexible';

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
            86400,
          );
        }
      } catch (error) {
        logger.error(error);

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
    const rateLimit = rateLimiterUnion(selectedPlan, baseUrl);

    const perPage = req?.query?.per_page || 25;
    const consumeCount = Math.ceil(+perPage / 25);

    try {
      if (keyId) {
        const tokenKey = getTokenKey(id, keyId);
        const now = dayjs.utc().toISOString();
        const usageKey = `usage:${keyId}:${now.split('T')[0]}`;
        await ratelimiterRedisClient.hincrby(usageKey, now, consumeCount);
        await ratelimiterRedisClient.expire(usageKey, 60 * 60 * 24 * 31);

        await rateLimit.consume(tokenKey, consumeCount);
      }
    } catch (error) {
      logger.error(error);
    }

    try {
      await rateLimit.consume(id, consumeCount);

      return next();
    } catch (error) {
      return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
    }
  },
);

const checkIPInSubnets = (ipAddress: string): boolean => {
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
  const consumeCount = Math.ceil(+perPage / 25);

  const plan = await getPlan(baseUrl, token);

  try {
    await ratelimiterRedisClient.set(
      `user_plan:${key}`,
      JSON.stringify(plan),
      'EX',
      86400,
    );
  } catch (redisError) {
    logger.error(redisError, 'Error caching user plan in Redis.');
  }
  const rateLimit = rateLimiterUnion(plan, baseUrl);

  try {
    if (tokenKey) {
      const [, keyId] = tokenKey.split('_');
      const tokenKeyValue = parseInt(keyId, 10);
      const now = dayjs.utc().toISOString();
      const usageKey = `usage:${tokenKeyValue}:${now.split('T')[0]}`;
      await ratelimiterRedisClient.hincrby(usageKey, now, consumeCount);
      await ratelimiterRedisClient.expire(usageKey, 60 * 60 * 24 * 31);

      await rateLimit.consume(tokenKey, consumeCount);
    }
  } catch (error) {
    logger.error(error);
  }

  try {
    await rateLimit.consume(key, consumeCount);

    return next();
  } catch (error) {
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
    logger.info('Free plan not found in Redis cache, fetching from DB.');

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
        logger.error(redisError, 'Error caching free plan in Redis.');
      }

      return freePlan;
    }
    logger.warn('No valid free plan found, returning null.');

    return null;
  } catch (error) {
    logger.error(
      error,
      'Free plan not available, applying default rate limit.',
    );

    return null;
  }
};

const isValidToken = (apiKey: string): boolean => {
  return /^[A-F0-9]{32}$/i.test(apiKey);
};

const rateLimiterUnion = (plan: Plan, baseUrl: string) => {
  let pointsMinute = plan.limit_per_minute;
  let pointsDay = plan.limit_per_day;
  let pointsMonth = plan.limit_per_month;

  if (baseUrl === KITWALLET_PATH && plan.id === DEFAULT_PLAN.id) {
    pointsMinute = 150;
    pointsDay = 10000;
    pointsMonth = 300000;
  }

  const minuteRateLimiter = new RateLimiterRedis({
    duration: 60, // 1 min
    keyPrefix: `plan_${plan.id}_minute`,
    points: pointsMinute,
    storeClient: ratelimiterRedisClient,
  });
  const dayRateLimiter = new RateLimiterRedis({
    duration: 60 * 60 * 24, // 1 day
    keyPrefix: `plan_${plan.id}_day`,
    points: pointsDay,
    storeClient: ratelimiterRedisClient,
  });
  const monthRateLimiter = new RateLimiterRedis({
    duration: 60 * 60 * 24 * 30, // 30 days
    keyPrefix: `plan_${plan.id}_month`,
    points: pointsMonth,
    storeClient: ratelimiterRedisClient,
  });

  if (baseUrl === KITWALLET_PATH || baseUrl === SEARCH_PATH) {
    return new RateLimiterUnion(minuteRateLimiter, dayRateLimiter);
  }

  return new RateLimiterUnion(
    minuteRateLimiter,
    dayRateLimiter,
    monthRateLimiter,
  );
};

const getTokenKey = (id: number, kId: number) => `${id}_${kId}`;

export default rateLimiter;
