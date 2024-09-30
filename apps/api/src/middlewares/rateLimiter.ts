import { NextFunction, Request, Response } from 'express';
import { RateLimiterRedis, RateLimiterUnion } from 'rate-limiter-flexible';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import logger from '#libs/logger';
import { userSql } from '#libs/postgres';
import { ratelimiterRedisClient } from '#libs/ratelimiterRedis';
import { redisClient } from '#libs/redis';
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

const rateLimiter = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = (req.user as User)?.id;
    const keyId = (req.user as User)?.key_id;
    const date = dayjs.utc().toISOString();
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

    const cachedPlan = await redisClient.get(`user_plan:${id}`);
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
          await redisClient.set(
            `user_plan:${id}`,
            JSON.stringify(selectedPlan),
            'EX',
            86400,
          );
        }
      } catch (error) {
        return next();
      }
    }

    if (!selectedPlan) {
      if (keyId) {
        const tokenKey = getTokenKey(id, keyId);
        return await useFreePlan(req, res, next, id, tokenKey);
      }

      return await useFreePlan(req, res, next, id);
    }

    const rateLimit = rateLimiterUnion(selectedPlan);

    const perPage = req?.query?.per_page || 25;
    const consumeCount = Math.ceil(+perPage / 25);

    try {
      await rateLimit.consume(id, consumeCount);

      if (keyId) {
        const tokenKey = getTokenKey(id, keyId);
        await rateLimit.consume(tokenKey, consumeCount);
      }

      return next();
    } catch (error) {
      return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
    }
  },
);

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

  await redisClient.set(`user_plan:${key}`, JSON.stringify(plan), 'EX', 86400);

  const rateLimit = rateLimiterUnion(plan);

  try {
    await rateLimit.consume(key, consumeCount);

    if (tokenKey) {
      await rateLimit.consume(tokenKey, consumeCount);
    }

    return next();
  } catch (error) {
    return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
  }
};

const getPlan = async (baseUrl: string, token: string) => {
  if (baseUrl === KITWALLET_PATH || SEARCH_PATH) {
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
    const cachedFreePlan = await redisClient.get('free_plan');
    if (cachedFreePlan) {
      return JSON.parse(cachedFreePlan);
    }
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
      await redisClient.set('free_plan', JSON.stringify(freePlan), 'EX', 86400);
    }

    return freePlan;
  } catch (error) {
    logger.error('Free plan not available, applying default rate limit.');

    return null;
  }
};

const isValidToken = (apiKey: string): boolean => {
  return /^[A-F0-9]{32}$/i.test(apiKey);
};

const rateLimiterUnion = (plan: Plan) => {
  const pointsMinute = plan.limit_per_minute;
  const pointsDay = plan.limit_per_day;
  const pointsMonth = plan.limit_per_month;

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

  return new RateLimiterUnion(
    minuteRateLimiter,
    dayRateLimiter,
    monthRateLimiter,
  );
};

const getTokenKey = (id: number, kId: number) => `${id}_${kId}`;

export default rateLimiter;
