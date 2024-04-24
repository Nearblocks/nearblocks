import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';

const list = catchAsync(async (_req: Request, res: Response) => {
  const charts = await sql`
    SELECT
      *
    FROM
      daily_stats
    ORDER BY
      date ASC
  `;

  return res.status(200).json({ charts });
});

const latest = catchAsync(async (_req: Request, res: Response) => {
  const charts = await sql`
    SELECT
      date,
      near_price,
      txns
    FROM
      daily_stats
    ORDER BY
      date DESC
    LIMIT
      15
  `;

  return res.status(200).json({ charts });
});

const tps = catchAsync(async (_req: Request, res: Response) => {
  const charts = await sql`
    SELECT
      date,
      txns,
      shards
    FROM
      tps
    WHERE
      date >= (
        EXTRACT(
          EPOCH
          FROM
            NOW() - INTERVAL '10 minutes'
        )
      )::BIGINT
    ORDER BY
      date DESC;
  `;

  return res.status(200).json({ charts });
});

export default { latest, list, tps };
