import { Response } from 'express';

import type { AccountBalanceStats } from 'nb-schemas';

import catchAsync from '#libs/async';
import { dbBalance } from '#libs/pgp';
import { Balance } from '#libs/schema/analytics';
import { msToNsTime } from '#libs/utils';
import sql from '#sql/accounts';
import { RequestValidator } from '#types/types';

// v1 analytics endpoints served by reusing the shared v3 account stats query
// modules (#sql/accounts) against the split balance DB and reformatting to the
// legacy v1 JSON shape. No v3 service file is imported or modified — the query
// orchestration mirrors services/v3/accounts/stats.

const LIMIT = 365; // v3 max (nb-schemas accounts/stats request limit)

/**
 * GET /v1/analytics/{account}/balance
 *
 * Non-1:1: v1 ran `time_bucket_gapfill` + `locf` over `balance_events_daily`,
 * returning a dense day-by-day series from the account's first balance event to
 * now, with the last known value carried forward. v3's `account_near_stats`
 * aggregate has one row per day that actually changed, so the series is sparse:
 * days with no balance event are absent instead of repeating the previous
 * value, and it is capped at the newest 365 rows (v1 was unbounded).
 *
 * Field renames back to the v1 names: `amount_staked` -> `staked_amount`,
 * `amount` -> `nonstaked_amount`. v3's `account` and `storage_usage` columns are
 * dropped (v1 never emitted them). `date` is converted from v3's `YYYY-MM-DD`
 * back to the v1 nanosecond timestamp string of that UTC midnight.
 */
const balance = catchAsync(
  async (req: RequestValidator<Balance>, res: Response) => {
    const account = req.validator.data.account;

    const stats = await dbBalance.manyOrNone<AccountBalanceStats>(
      sql.stats.balance,
      { account, limit: LIMIT },
    );

    const analytics = stats.map((row) => ({
      date: msToNsTime(new Date(`${row.date}T00:00:00Z`).getTime()),
      nonstaked_amount: row.amount,
      staked_amount: row.amount_staked,
    }));

    return res.status(200).json({ analytics });
  },
);

export default { balance };
