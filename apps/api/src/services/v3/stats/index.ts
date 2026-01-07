import type { DailyStats, DailyStatsReq, Stats, TpsStats } from 'nb-schemas';
import response from 'nb-schemas/dist/stats/response.js';

import { dbBase } from '#libs/pgp';
import { msToNsTime } from '#libs/utils';
import { responseHandler } from '#middlewares/response';
import { RequestValidator } from '#middlewares/validate';
import sql from '#sql/stats';

const stats = responseHandler(response.stats, async () => {
  const data = await dbBase.one<Stats>(sql.stats);

  return { data };
});

const daily = responseHandler(
  response.daily,
  async (req: RequestValidator<DailyStatsReq>) => {
    const limit = req.validator.limit;
    const date = req.validator.date
      ? msToNsTime(new Date(`${req.validator.date}T00:00:00Z`).getTime())
      : null;

    const data = await dbBase.manyOrNone<DailyStats>(sql.daily, {
      date,
      limit,
    });

    return { data };
  },
);

const tps = responseHandler(response.tps, async () => {
  const data = await dbBase.manyOrNone<TpsStats>(sql.tps);

  return { data };
});

export default { daily, stats, tps };
