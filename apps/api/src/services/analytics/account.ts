import { Response } from 'express';

import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import sql from '#libs/postgres';
import { Balance } from '#libs/schema/analytics';
import { msToNsTime } from '#libs/utils';
import { RequestValidator } from '#types/types';

const balance = catchAsync(
  async (req: RequestValidator<Balance>, res: Response) => {
    const account = req.validator.data.account;

    const [balance] = await sql`
      SELECT
        MIN(time_daily) AS start
      FROM
        balance_events_daily
      WHERE
        account = ${account};
    `;

    if (!balance?.start) {
      return res.status(200).json({ analytics: [] });
    }

    const finish = msToNsTime(dayjs.utc().valueOf());

    const analytics = await sql`
      SELECT
        time_bucket_gapfill (
          BIGINT '86400000000000',
          time_daily,
          start => ${balance.start},
          finish => ${finish}
        ) AS date,
        locf (MAX(staked_amount), treat_null_as_missing => TRUE) AS staked_amount,
        locf (
          MAX(nonstaked_amount),
          treat_null_as_missing => TRUE
        ) AS nonstaked_amount
      FROM
        balance_events_daily
      WHERE
        account = ${account}
      GROUP BY
        date
      ORDER BY
        date DESC;
    `;

    return res.status(200).json({ analytics });
  },
);

export default {
  balance,
};
