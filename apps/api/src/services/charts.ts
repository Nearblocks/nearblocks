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
      JSON_AGG(JSON_BUILD_OBJECT('shard', shard, 'txns', txns)) AS data
    FROM
      (
        SELECT
          chunks.shard_id AS shard,
          COUNT(*) AS txns,
          block_timestamp / 1000000000 AS date
        FROM
          transactions
          JOIN chunks ON chunks.chunk_hash = transactions.included_in_chunk_hash
        WHERE
          block_timestamp >= (
            EXTRACT(
              EPOCH
              FROM
                NOW() - INTERVAL '6 hours'
            ) * 1000000000
          )::BIGINT
        GROUP BY
          chunks.shard_id,
          block_timestamp / 1000000000
      ) AS subquery
    GROUP BY
      date
    ORDER BY
      date;
  `;

  return res.status(200).json({ charts });
});

export default { latest, list, tps };
