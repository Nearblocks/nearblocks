import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ratelimiterRedisClient } from '#libs/ratelimiterRedis';
import { Plan } from '#types/types';

import rateLimiter from './rateLimiter.js';

const RATE_LIMIT_MESSAGE =
  'You have exceeded your API request limit. Please try again later or upgrade your plan for higher limits at https://nearblocks.io/apis.';
const QUOTA_MESSAGE =
  "You have reached your plan's daily or monthly API quota. Upgrade your plan at https://nearblocks.io/apis or wait until your quota resets.";

vi.mock('#config', () => ({ default: { apiAccessKey: '' } }));
vi.mock('#libs/logger', () => ({ default: { error: vi.fn() } }));
vi.mock('#libs/postgres', () => ({ userSql: vi.fn() }));
vi.mock('#libs/ratelimiterRedis', () => ({
  ratelimiterRedisClient: { get: vi.fn(), set: vi.fn() },
}));

// Back RateLimiterRedis with RateLimiterMemory (same RateLimiterAbstract API,
// keyPrefix and union behaviour). The middleware builds new limiters on every
// request, so hand back one shared instance per keyPrefix to keep the counts.
const limiters = vi.hoisted(() => new Map<string, unknown>());
vi.mock('rate-limiter-flexible', async (importOriginal) => {
  const actual = await importOriginal<typeof import('rate-limiter-flexible')>();

  return {
    ...actual,
    RateLimiterRedis: function (opts: {
      duration: number;
      keyPrefix: string;
      points: number;
    }) {
      if (!limiters.has(opts.keyPrefix)) {
        limiters.set(
          opts.keyPrefix,
          new actual.RateLimiterMemory({
            duration: opts.duration,
            keyPrefix: opts.keyPrefix,
            points: opts.points,
          }),
        );
      }

      return limiters.get(opts.keyPrefix);
    },
  };
});

const plan = (limits: Partial<Plan>): Plan => ({
  id: 7,
  limit_per_day: 100,
  limit_per_minute: 100,
  limit_per_month: 100,
  limit_per_second: 1,
  price_annually: 0,
  price_monthly: 0,
  title: 'Paid',
  ...limits,
});

// The plan the Redis cache hands back: `user_plan:<id>` for paid users,
// `free_plan` for everyone else.
const cache = (paid: null | Plan, free: Plan = plan({ id: 1 })) =>
  vi.mocked(ratelimiterRedisClient.get).mockImplementation(async (key) => {
    if (String(key).startsWith('user_plan:')) {
      return paid ? JSON.stringify(paid) : null;
    }

    return key === 'free_plan' ? JSON.stringify(free) : null;
  });

type Result = { body?: unknown; next: boolean; status?: number };

const request = (
  user?: { id: number; key_id?: number },
  perPage = 25,
): Promise<Result> =>
  new Promise((resolve) => {
    const req = {
      baseUrl: '/v1/account',
      headers: {},
      ip: '203.0.113.7',
      query: { per_page: String(perPage) },
      user,
    } as unknown as Request;
    const result: Result = { next: false };
    const res = {
      json(body: unknown) {
        resolve({ ...result, body });
        return this;
      },
      locals: {},
      status(code: number) {
        result.status = code;
        return this;
      },
    } as unknown as Response;
    const next: NextFunction = () => resolve({ next: true });

    rateLimiter(req, res, next);
  });

// Sends `count` requests, then returns the result of one more.
const exhaust = async (
  count: number,
  user?: { id: number; key_id?: number },
) => {
  for (let i = 0; i < count; i++) {
    expect((await request(user)).next).toBe(true);
  }

  return request(user);
};

const rejected = (message: string) => ({
  body: { message },
  next: false,
  status: 429,
});

describe('rateLimiter', () => {
  beforeEach(() => {
    limiters.clear();
    vi.mocked(ratelimiterRedisClient.get).mockReset();
  });

  it('keeps the rate limit message when a paid minute window runs out', async () => {
    cache(plan({ limit_per_minute: 2 }));

    expect(await exhaust(2, { id: 1 })).toEqual(rejected(RATE_LIMIT_MESSAGE));
  });

  it('sends the quota message when a paid day window runs out', async () => {
    cache(plan({ limit_per_day: 2 }));

    expect(await exhaust(2, { id: 1 })).toEqual(rejected(QUOTA_MESSAGE));
  });

  it('sends the quota message when a paid month window runs out', async () => {
    cache(plan({ limit_per_month: 2 }));

    expect(await exhaust(2, { id: 1 })).toEqual(rejected(QUOTA_MESSAGE));
  });

  it('sends the quota message when a request costs more than the paid day window', async () => {
    cache(plan({ limit_per_day: 1 }));

    // Nothing counted yet, so the pre-check passes and consume() rejects.
    expect(await request({ id: 1 }, 50)).toEqual(rejected(QUOTA_MESSAGE));
  });

  it('sends the quota message when the day window of a paid API key runs out', async () => {
    cache(plan({ limit_per_day: 2 }));

    expect(await exhaust(2, { id: 1, key_id: 3 })).toEqual(
      rejected(QUOTA_MESSAGE),
    );
  });

  it('sends the quota message when the paid minute and day windows both run out', async () => {
    cache(plan({ limit_per_day: 2, limit_per_minute: 2 }));

    expect(await exhaust(2, { id: 1 })).toEqual(rejected(QUOTA_MESSAGE));
  });

  it('keeps the rate limit message when an anonymous day window runs out', async () => {
    cache(null, plan({ id: 1, limit_per_day: 2 }));

    expect(await exhaust(2)).toEqual(rejected(RATE_LIMIT_MESSAGE));
  });

  it('lets a paid request within its limits through', async () => {
    cache(plan({}));

    expect(await request({ id: 1 })).toEqual({ next: true });
  });
});
