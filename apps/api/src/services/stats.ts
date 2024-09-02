import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import redis from '#libs/redis';
import { Price } from '#libs/schema/stats';
import { RequestValidator } from '#types/types';

const EXPIRY = 5; // 5 sec

const latest = catchAsync(async (_req: Request, res: Response) => {
  const stats = await redis.cache(
    'stats:latest',
    async () => {
      try {
        return await sql`
          SELECT
            *
          FROM
            stats
          LIMIT
            1
        `;
      } catch (error) {
        return null;
      }
    },
    EXPIRY,
  );

  return res.status(200).json({ stats });
});

const price = catchAsync(
  async (req: RequestValidator<Price>, res: Response) => {
    const date = req.validator.data.date;

    if (!date) {
      const stats = await sql`
        SELECT
          near_price
        FROM
          stats
        LIMIT
          1
      `;

      return res.status(200).json({ stats });
    }

    const stats = await sql`
      SELECT
        near_price
      FROM
        daily_stats_new
      WHERE
        date = ${date}
      LIMIT
        1
    `;

    return res.status(200).json({ stats });
  },
);

export default { latest, price };
