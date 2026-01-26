import dayjs from 'dayjs';

import type {} from 'nb-schemas';
import {
  AccountBalanceStatsReq,
  AccountFTStatsReq,
  AccountNearStatsReq,
  AccountStatsOverviewReq,
  AccountTxnsHeatmapReq,
  AccountTxnStatsReq,
} from 'nb-schemas/dist/accounts/stats/request.js';
import response, {
  AccountBalanceStats,
  AccountFTStats,
  AccountNearStats,
  AccountStatsOverview,
  AccountTxnStats,
} from 'nb-schemas/dist/accounts/stats/response.js';

import { dbBalance, dbBase, dbEvents } from '#libs/pgp';
import { msToNsTime } from '#libs/utils';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/accounts';

const overview = responseHandler(
  response.overview,
  async (req: RequestValidator<AccountStatsOverviewReq>) => {
    const account = req.validator.account;

    const stats = await dbBase.oneOrNone<AccountStatsOverview>(
      sql.stats.overview,
      { account },
    );

    return { data: stats?.first_day ? stats : null };
  },
);

const heatmap = responseHandler(
  response.txns,
  async (req: RequestValidator<AccountTxnsHeatmapReq>) => {
    const account = req.validator.account;
    const start = msToNsTime(
      dayjs.utc().subtract(11, 'months').startOf('month').valueOf(),
    );

    const stats = await dbBase.manyOrNone<AccountTxnStats>(sql.stats.txns, {
      account,
      limit: undefined,
      start,
    });

    return { data: stats };
  },
);

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<AccountTxnStatsReq>) => {
    const account = req.validator.account;
    const limit = req.validator.limit;

    const stats = await dbBase.manyOrNone<AccountTxnStats>(sql.stats.txns, {
      account,
      limit,
      start: undefined,
    });

    return { data: stats };
  },
);

const balance = responseHandler(
  response.balance,
  async (req: RequestValidator<AccountBalanceStatsReq>) => {
    const account = req.validator.account;
    const limit = req.validator.limit;

    const stats = await dbBalance.manyOrNone<AccountBalanceStats>(
      sql.stats.balance,
      { account, limit },
    );

    return { data: stats };
  },
);

const near = responseHandler(
  response.near,
  async (req: RequestValidator<AccountNearStatsReq>) => {
    const account = req.validator.account;
    const limit = req.validator.limit;

    const stats = await dbBase.manyOrNone<AccountNearStats>(sql.stats.near, {
      account,
      limit,
    });

    return { data: stats };
  },
);

const fts = responseHandler(
  response.fts,
  async (req: RequestValidator<AccountFTStatsReq>) => {
    const account = req.validator.account;
    const limit = req.validator.limit;

    const stats = await dbEvents.manyOrNone<AccountFTStats>(sql.stats.fts, {
      account,
      limit,
    });

    return { data: stats };
  },
);

export default { balance, fts, heatmap, near, overview, txns };
