import { Response } from 'express';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import { dbBase } from '#libs/pgp';
import sql from '#libs/postgres';
import redis from '#libs/redis';
import { Fees, Supply } from '#libs/schema/legacy';
import { msToNsTime, yoctoToNear } from '#libs/utils';
import blocksSql from '#sql/blocks';
import statsSql from '#sql/stats';
import { RequestValidator } from '#types/types';

type BlockSupply = { block_timestamp: string; total_supply: string };

// v1 response shapes, served from v3 data.
const sendSupply = (
  req: RequestValidator<Supply>,
  res: Response,
  yocto: string,
  body: Record<string, string>,
) => {
  const { format, unit } = req.validator.data;
  const value = unit === 'near' ? (+yoctoToNear(yocto)).toFixed() : yocto;

  if (format === 'coingecko') {
    return res.status(200).json({ result: value });
  }

  if (unit === 'near') return res.send(value);

  return res.status(200).json(body);
};

const supply = catchAsync(
  async (req: RequestValidator<Supply>, res: Response) => {
    const { total_supply } = await dbBase.one<{ total_supply: string }>(
      statsSql.stats,
    );

    return sendSupply(req, res, total_supply, {
      circulating_supply_in_yoctonear: total_supply,
      timestamp: msToNsTime(dayjs.utc().startOf('day').valueOf()),
    });
  },
);

const total = catchAsync(
  async (req: RequestValidator<Supply>, res: Response) => {
    const block = await redis.cache<BlockSupply>(
      'v1:legacy:total-supply',
      () => dbBase.one<BlockSupply>(blocksSql.supply),
      5, // cache results for 5s
    );

    return sendSupply(req, res, block.total_supply, {
      timestamp: block.block_timestamp,
      total_supply_in_yoctonear: block.total_supply,
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
