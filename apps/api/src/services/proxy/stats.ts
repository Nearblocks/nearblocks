import { Request, Response } from 'express';

import type { PriceStats, Stats } from 'nb-schemas';

import catchAsync from '#libs/async';
import { dbBase } from '#libs/pgp';
import redis from '#libs/redis';
import { Price } from '#libs/schema/stats';
import { msToNsTime } from '#libs/utils';
import sql from '#sql/stats';
import { RequestValidator } from '#types/types';

// v1 stats endpoints served by reusing the shared v3 stats query modules
// (#sql/stats) against the split DBs and reformatting to the legacy v1 JSON
// shape. No v3 service file is imported or modified — the query orchestration
// mirrors services/v3/stats.

const EXPIRY = 5; // 5 sec

// The v3 `stats` table is not the legacy `stats` table: it renamed
// `change_24`->`change_24h` and `volume`->`volume_24h`, dropped the serial `id`
// and the `high_24h`/`high_all`/`low_24h`/`low_all` price extremes, and added
// `tps`. Reverse the renames and emit the dropped columns as null so v1 clients
// that index into the row keep working.
const toLegacy = (row: Stats) => ({
  avg_block_time: row.avg_block_time,
  change_24: row.change_24h,
  circulating_supply: row.circulating_supply,
  gas_price: row.gas_price,
  high_24h: null,
  high_all: null,
  id: null,
  low_24h: null,
  low_all: null,
  market_cap: row.market_cap,
  near_btc_price: row.near_btc_price,
  near_price: row.near_price,
  nodes_online: row.nodes_online,
  total_supply: row.total_supply,
  total_txns: row.total_txns,
  tps: row.tps,
  volume: row.volume_24h,
});

/**
 * GET /v1/stats
 *
 * Non-1:1: `change_24h`/`volume_24h` are renamed back to `change_24`/`volume`.
 * `high_24h`, `high_all`, `low_24h`, `low_all` and the serial `id` do not exist
 * in the v3 `stats` table and are emitted as `null` (key preserved). The row is
 * cached under a `proxy:` key because the v3 stats service does not cache.
 */
const latest = catchAsync(async (_req: Request, res: Response) => {
  const stats = await redis.cache(
    'proxy:v1:stats:latest',
    async () => {
      try {
        const row = await dbBase.oneOrNone<Stats>(sql.stats);

        return row ? [toLegacy(row)] : [];
      } catch (error) {
        return null;
      }
    },
    EXPIRY,
  );

  return res.status(200).json({ stats });
});

/**
 * GET /v1/stats/price
 *
 * Non-1:1: with `date`, the row comes from the v3 `daily_stats` table keyed by
 * a nanosecond bucket instead of the legacy `daily_stats_new` DATE column —
 * same UTC day, same `near_price` string. Without `date` it is the live v3
 * `stats` row, as before.
 */
const price = catchAsync(
  async (req: RequestValidator<Price>, res: Response) => {
    const date = req.validator.data.date;

    if (!date) {
      const row = await dbBase.oneOrNone<Stats>(sql.stats);

      return res
        .status(200)
        .json({ stats: row ? [{ near_price: row.near_price }] : [] });
    }

    const rows = await dbBase.manyOrNone<PriceStats>(sql.price, {
      date: msToNsTime(new Date(`${date}T00:00:00Z`).getTime()),
      limit: 1,
    });

    return res
      .status(200)
      .json({ stats: rows.map((row) => ({ near_price: row.near_price })) });
  },
);

export default { latest, price };
