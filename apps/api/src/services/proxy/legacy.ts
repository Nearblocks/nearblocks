import { Response } from 'express';

import type { Stats } from 'nb-schemas';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import { dbBase } from '#libs/pgp';
import { rollingWindowList } from '#libs/response';
import { Fees, Supply } from '#libs/schema/legacy';
import { msToNsTime, yoctoToNear } from '#libs/utils';
import blocksSql from '#sql/blocks';
import statsSql from '#sql/stats';
import { RequestValidator } from '#types/types';

// v1 legacy supply/fees endpoints served by reusing the shared v3 stats/blocks
// query modules (#sql/stats, #sql/blocks) against the split DBs and returning the
// raw legacy response shapes (bare text / `{ result }` / a JSON object, depending
// on `unit` + `format`). No v3 service file is imported or modified. `/ping` and
// `/nodes` touch no database and keep their legacy handlers.

type BlockTimestamp = { block_timestamp: string };

const latestStats = () => dbBase.oneOrNone<Stats>(statsSql.stats);

// Newest block, mirroring the /v3/blocks list orchestration (rolling window over
// block_timestamp) with a limit of 1.
const latestBlock = async () => {
  const [block] = await rollingWindowList<BlockTimestamp>(
    (start, end, limit) => {
      return dbBase.manyOrNone<BlockTimestamp>(blocksSql.blocks, {
        cursor: { timestamp: null },
        direction: 'desc',
        end,
        limit,
        start,
      });
    },
    { limit: 1, start: config.baseStart },
  );

  return block ?? null;
};

// v1 emitted the supply figure three different ways depending on the query
// params; reproduced verbatim: `unit=near` renders whole NEAR (and, without
// `format=coingecko`, as a bare text body rather than JSON).
const respond = (
  res: Response,
  value: null | string,
  unit: string,
  format: string | undefined,
  json: (value: null | string) => Record<string, unknown>,
) => {
  if (unit === 'near') {
    const near = value === null ? null : (+yoctoToNear(value)).toFixed();

    if (format === 'coingecko') return res.status(200).json({ result: near });

    return res.send(near);
  }

  if (format === 'coingecko') return res.status(200).json({ result: value });

  return res.status(200).json(json(value));
};

/**
 * GET /v1/legacy/total-supply
 *
 * Non-1:1: v1 read `total_supply` off the newest `blocks` row. No v3 query
 * module selects that column, so the figure now comes from the live v3 `stats`
 * snapshot row (the same chain total supply, refreshed on its own cadence) while
 * `timestamp` still comes from the newest block. The two can therefore be a few
 * seconds out of step with each other. `unit`/`format` behave exactly as before.
 */
const total = catchAsync(
  async (req: RequestValidator<Supply>, res: Response) => {
    const { format, unit } = req.validator.data;
    const [stats, block] = await Promise.all([latestStats(), latestBlock()]);

    return respond(res, stats?.total_supply ?? null, unit, format, (value) => ({
      timestamp: block?.block_timestamp ?? null,
      total_supply_in_yoctonear: value,
    }));
  },
);

/**
 * GET /v1/legacy/circulating-supply
 *
 * Faithful: v1 reported the `stats` row's `total_supply` (not
 * `circulating_supply`) under `circulating_supply_in_yoctonear`, and the v3
 * `stats` table keeps both columns — the legacy column choice is preserved.
 * `timestamp` is today's UTC midnight in nanoseconds, as before.
 */
const supply = catchAsync(
  async (req: RequestValidator<Supply>, res: Response) => {
    const { format, unit } = req.validator.data;
    const stats = await latestStats();

    return respond(res, stats?.total_supply ?? null, unit, format, (value) => ({
      circulating_supply_in_yoctonear: value,
      timestamp: msToNsTime(dayjs.utc().startOf('day').valueOf()),
    }));
  },
);

/**
 * GET /v1/legacy/fees
 *
 * Faithful: reads the per-day `tokens_burnt` (yoctoNEAR) straight off the
 * `outcome_stats` continuous aggregate — the same execution-outcome sum v1
 * computed with `SUM(tokens_burnt)`, excluding the receipt-conversion burn.
 * Reports complete past days (`day` → yesterday; `week` → the last 7), and a day
 * with no aggregate row emits `0`, as v1 did.
 */
const fees = catchAsync(async (req: RequestValidator<Fees>, res: Response) => {
  const period = req.validator.data.period;
  const length = period === 'week' ? 7 : 1;
  const start = dayjs.utc().subtract(length, 'day').startOf('day');
  const end = dayjs.utc().startOf('day');

  const rows = await dbBase.manyOrNone<{ date: string; fee: string }>(
    statsSql.fees,
    {
      end: msToNsTime(end.valueOf()),
      start: msToNsTime(start.valueOf()),
    },
  );
  const feeByDate = new Map(rows.map((row) => [row.date, row.fee]));

  const resp = Array.from({ length }, (_, index) => {
    const date = dayjs
      .utc()
      .subtract(index + 1, 'day')
      .startOf('day')
      .format('YYYY-MM-DD');

    return { collected_fee_in_yoctonear: feeByDate.get(date) ?? 0, date };
  });

  if (period === 'day') return res.status(200).json(resp[0]);

  return res.status(200).json(resp);
});

export default { fees, supply, total };
