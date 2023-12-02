import { NextFunction, Request, Response } from 'express';
import { RateLimiterRedis, RateLimiterUnion } from 'rate-limiter-flexible';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import { mainnetDb } from '#libs/db';
import { mainnetRedis } from '#libs/redis';
import { getFreePlan, keyBinder } from '#libs/utils';
import { SubscriptionStatus } from '#types/enums';
import { Plan, User } from '#types/types';

const rateLimiter = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = (req.user as User)?.id;

    if (!id) {
      return await useFreePlan(res, next, req.ip!);
    }

    const date = dayjs.utc().toISOString();
    const { query, values } = keyBinder(
      `
        SELECT
          p.*
        FROM
          api__plans p
          INNER JOIN api__subscriptions s ON s.plan_id = p.id
        WHERE
          s.user_id = :user
          AND s.status IN ('${SubscriptionStatus.ACTIVE}', '${SubscriptionStatus.TRIALING}')
        ORDER BY
          s.end_date DESC
        LIMIT
          1
      `,
      { date, user: id },
    );

    const { rows } = await mainnetDb.query(query, values);
    const plan = rows?.[0];

    if (!plan) {
      return await useFreePlan(res, next, id);
    }

    const rateLimit = rateLimiterUnion(plan);

    try {
      await rateLimit.consume(id);
      return next();
    } catch (error) {
      return res.status(429).json({ message: 'Too Many Requests' });
    }
  },
);

const useFreePlan = async (
  res: Response,
  next: NextFunction,
  key: number | string,
) => {
  const freePlan = await getFreePlan();

  if (!freePlan) {
    return res.status(429).json({ message: 'Too Many Requests' });
  }

  const rateLimit = rateLimiterUnion(freePlan);

  try {
    await rateLimit.consume(key);
    return next();
  } catch (error) {
    return res.status(429).json({ message: 'Too Many Requests' });
  }
};

const rateLimiterUnion = (plan: Plan) => {
  const pointsMinute = plan.limit_per_minute;
  const pointsDay = plan.limit_per_day;
  const pointsMonth = plan.limit_per_month;

  const minuteRateLimiter = new RateLimiterRedis({
    duration: 60, // 1 min
    keyPrefix: `plan_${plan.id}_minute`,
    points: pointsMinute,
    storeClient: mainnetRedis,
  });
  const dayRateLimiter = new RateLimiterRedis({
    duration: 60 * 60 * 24, // 1 day
    keyPrefix: `plan_${plan.id}_day`,
    points: pointsDay,
    storeClient: mainnetRedis,
  });
  const monthRateLimiter = new RateLimiterRedis({
    duration: 60 * 60 * 24 * 30, // 30 days
    keyPrefix: `plan_${plan.id}_month`,
    points: pointsMonth,
    storeClient: mainnetRedis,
  });

  return new RateLimiterUnion(
    minuteRateLimiter,
    dayRateLimiter,
    monthRateLimiter,
  );
};

export default rateLimiter;
