import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import redis from '#libs/redis';

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

export default { latest };
