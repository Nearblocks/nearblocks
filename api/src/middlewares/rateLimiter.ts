import { RateLimiterRedis, RateLimiterUnion } from 'rate-limiter-flexible';

import dayjs from '#libs/dayjs';
import { mainnetDb } from '#libs/db';
import catchAsync from '#libs/async';
import { Plan, User } from '#ts/types';
import { mainnetRedis } from '#libs/redis';
import { SubscriptionStatus } from '#ts/enums';
import { getFreePlan, keyBinder } from '#libs/utils';
import { NextFunction, Request, Response } from 'express';

const rateLimiter = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = (req.user as User)?.id;
    const realIp = req?.headers['x-real-ip'] || req.ip;

    if (!id) {
      return await useFreePlan(res, next, realIp.toString());
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
      { user: id, date },
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
  key: string | number,
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
    storeClient: mainnetRedis,
    keyPrefix: `plan_${plan.id}_minute`,
    points: pointsMinute,
    duration: 60, // 1 min
  });
  const dayRateLimiter = new RateLimiterRedis({
    storeClient: mainnetRedis,
    keyPrefix: `plan_${plan.id}_day`,
    points: pointsDay,
    duration: 60 * 60 * 24, // 1 day
  });
  const monthRateLimiter = new RateLimiterRedis({
    storeClient: mainnetRedis,
    keyPrefix: `plan_${plan.id}_month`,
    points: pointsMonth,
    duration: 60 * 60 * 24 * 30, // 30 days
  });

  return new RateLimiterUnion(
    minuteRateLimiter,
    dayRateLimiter,
    monthRateLimiter,
  );
};

export default rateLimiter;
