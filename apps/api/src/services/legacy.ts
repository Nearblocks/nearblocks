import { Response } from 'express';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import sql from '#libs/postgres';
import { Fees, Supply } from '#libs/schema/legacy';
import { msToNsTime, yoctoToNear } from '#libs/utils';
import { RequestValidator } from '#types/types';

const supply = catchAsync(
  async (req: RequestValidator<Supply>, res: Response) => {
    const unit = req.validator.data.unit;
    const format = req.validator.data.format;

    const { rows } = await db.query(
      `
        SELECT
          *
        FROM
          stats
        LIMIT
          1
      `,
    );

    let circulatingSupply = rows?.[0]?.circulating_supply;
    if (unit === 'near') {
      circulatingSupply = (+yoctoToNear(circulatingSupply)).toFixed();

      if (format === 'coingecko') {
        return res.status(200).json({ result: circulatingSupply });
      }

      return res.send(circulatingSupply);
    }

    if (format === 'coingecko') {
      return res.status(200).json({ result: circulatingSupply });
    }

    return res.status(200).json({
      circulating_supply_in_yoctonear: rows?.[0]?.circulating_supply,
      timestamp: msToNsTime(dayjs.utc().startOf('day').valueOf()),
    });
  },
);

const total = catchAsync(
  async (req: RequestValidator<Supply>, res: Response) => {
    const unit = req.validator.data.unit;
    const format = req.validator.data.format;

    const { rows } = await db.query(
      `
        SELECT
          *
        FROM
          blocks
        ORDER BY
          block_timestamp DESC
        LIMIT
          1
      `,
    );

    let totalSupply = rows?.[0]?.total_supply;

    if (unit === 'near') {
      totalSupply = (+yoctoToNear(totalSupply)).toFixed();

      if (format === 'coingecko') {
        return res.status(200).json({ result: totalSupply });
      }

      return res.send(totalSupply);
    }

    if (format === 'coingecko') {
      return res.status(200).json({ result: totalSupply });
    }

    return res.status(200).json({
      timestamp: rows?.[0]?.block_timestamp,
      total_supply_in_yoctonear: rows?.[0]?.total_supply,
    });
  },
);

const fees = catchAsync(async (req: RequestValidator<Fees>, res: Response) => {
  const period = req.validator.data.period;
  const days = Array.from(
    { length: period === 'week' ? 7 : 1 },
    (_, index) => index + 1,
  );

  const resp = await Promise.all(
    days.map(async (day) => {
      const start = dayjs.utc().subtract(day, 'day').startOf('day');
      const end = dayjs
        .utc()
        .subtract(day - 1, 'day')
        .startOf('day');

      const rows = await sql`
        SELECT
          SUM(tokens_burnt)
        FROM
          execution_outcomes
        WHERE
          executed_in_block_timestamp >= ${msToNsTime(start.valueOf())}
          AND executed_in_block_timestamp < ${msToNsTime(end.valueOf())}
      `;

      return {
        collected_fee_in_yoctonear: rows?.[0]?.sum ?? 0,
        date: start.format('YYYY-MM-DD'),
      };
    }),
  );

  if (period === 'day') {
    return res.status(200).json(resp?.[0]);
  }

  return res.status(200).json(resp);
});

const ping = catchAsync(async (_req: Request, res: Response) => {
  return res.send('pong');
});

export default { fees, ping, supply, total };
