import { NextFunction, Request, Response } from 'express';
import { RateLimiterRedis, RateLimiterUnion } from 'rate-limiter-flexible';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import { userSql } from '#libs/postgres';
import { ratelimiterRedisClient } from '#libs/ratelimiterRedis';
import { SubscriptionStatus } from '#types/enums';
import { Plan, User } from '#types/types';

const CUSTOM_RATE_LIMIT_MESSAGE =
  'You have exceeded your API request limit. Please try again later or upgrade your plan for higher limits at https://nearblocks.io/apis.';

const rateLimiter = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = (req.user as User)?.id;
    const keyId = (req.user as User)?.key_id;
    const date = dayjs.utc().toISOString();

    // Bypass rate limiting for the near token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (token === config.apiAccessKey) {
      return next();
    }

    if (!id) {
      return await useFreePlan(res, next, req.ip!);
    }

    const plans = await userSql<Plan[]>`
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

    const plan = plans?.[0];

    if (!plan) {
      if (keyId) {
        const tokenKey = getTokenKey(id, keyId);
        return await useFreePlan(res, next, id, tokenKey);
      }
      return await useFreePlan(res, next, id);
    }

    const rateLimit = rateLimiterUnion(plan);
    try {
      if (keyId) {
        const tokenKey = getTokenKey(id, keyId);
        const now = dayjs.utc().toISOString();
        await userSql`
          INSERT INTO
            api_key_usages (user_id, key_id, TIME, count, plan_id)
          VALUES
            (
              ${id},
              ${keyId},
              ${now},
              1,
              ${plan.id}
            )
          ON CONFLICT (user_id, key_id, TIME) DO
          UPDATE
          SET
            count = api_key_usages.count + 1
        `;
        await rateLimit.consume(tokenKey);
      }
    } catch (error) {
      console.log(error);
    }
    try {
      await rateLimit.consume(id);
      return next();
    } catch (error) {
      return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
    }
  },
);

const useFreePlan = async (
  res: Response,
  next: NextFunction,
  key: number | string,
  tokenKey: null | string = null,
) => {
  const freePlan = await getFreePlan();

  if (!freePlan) {
    return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
  }

  const rateLimit = rateLimiterUnion(freePlan);
  try {
    if (tokenKey) {
      const [, keyId] = tokenKey.split('_');
      const tokenKeyValue = parseInt(keyId, 10);
      const now = dayjs.utc().toISOString();
      await userSql`
        INSERT INTO
          api_key_usages (user_id, key_id, TIME, count, plan_id)
        VALUES
          (
            ${key},
            ${tokenKeyValue},
            ${now},
            1,
            ${freePlan.id}
          )
        ON CONFLICT (user_id, key_id, TIME) DO
        UPDATE
        SET
          count = api_key_usages.count + 1
      `;
      await rateLimit.consume(tokenKey);
    }
  } catch (error) {
    console.log(error);
  }
  try {
    await rateLimit.consume(key);
    return next();
  } catch (error) {
    return res.status(429).json({ message: CUSTOM_RATE_LIMIT_MESSAGE });
  }
};

const getFreePlan = async () => {
  const plans = await userSql<Plan[]>`
    SELECT
      *
    FROM
      api__plans
    WHERE
      id = 1
  `;

  return plans?.[0];
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
