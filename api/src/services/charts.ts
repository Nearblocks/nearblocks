import { Request, Response } from 'express';

import db from '#libs/db';
import catchAsync from '#libs/async';

const list = catchAsync(async (_req: Request, res: Response) => {
  const { rows } = await db.query(
    `
      SELECT
        date,
        near_price,
        market_cap,
        total_supply,
        blocks,
        gas_fee,
        gas_used,
        avg_gas_price,
        avg_gas_limit,
        txns,
        txn_volume,
        txn_volume_usd,
        txn_fee,
        txn_fee_usd,
        total_addresses,
        addresses
      FROM
        daily_stats
      ORDER BY
        date ASC
    `,
  );

  return res.status(200).json({ charts: rows });
});

const latest = catchAsync(async (_req: Request, res: Response) => {
  const { rows } = await db.query(
    `
      SELECT
        date,
        near_price,
        txns
      FROM
        daily_stats
      ORDER BY
        date DESC
      LIMIT 15
    `,
  );

  return res.status(200).json({ charts: rows });
});

export default { list, latest };
