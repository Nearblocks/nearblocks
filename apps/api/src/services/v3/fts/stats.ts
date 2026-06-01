import type {
  FTContractStatsAccountTransfer,
  FTContractStatsAccountTransfersReq,
  FTContractStatsHeatmap,
  FTContractStatsHeatmapReq,
  FTContractStatsOverview,
  FTContractStatsOverviewReq,
  FTContractStatsTransfer,
  FTContractStatsTransfersReq,
} from 'nb-schemas';
import response from 'nb-schemas/dist/fts/stats/response.js';

import dayjs from '#libs/dayjs';
import { dbEvents } from '#libs/pgp';
import { msToNsTime } from '#libs/utils';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/fts';

const overview = responseHandler(
  response.overview,
  async (req: RequestValidator<FTContractStatsOverviewReq>) => {
    const contract = req.validator.contract;

    const stats = await dbEvents.oneOrNone<FTContractStatsOverview>(
      sql.stats.overview,
      { contract },
    );

    return { data: stats?.first_day ? stats : null };
  },
);

const heatmap = responseHandler(
  response.heatmap,
  async (req: RequestValidator<FTContractStatsHeatmapReq>) => {
    const contract = req.validator.contract;
    const start = msToNsTime(
      dayjs.utc().subtract(11, 'months').startOf('month').valueOf(),
    );

    const stats = await dbEvents.manyOrNone<FTContractStatsHeatmap>(
      sql.stats.heatmap,
      { contract, start },
    );

    return { data: stats };
  },
);

const transfers = responseHandler(
  response.transfers,
  async (req: RequestValidator<FTContractStatsTransfersReq>) => {
    const contract = req.validator.contract;
    const limit = req.validator.limit;

    const stats = await dbEvents.manyOrNone<FTContractStatsTransfer>(
      sql.stats.transfers,
      { contract, limit },
    );

    return { data: stats };
  },
);

const accountTransfers = responseHandler(
  response.accountTransfers,
  async (req: RequestValidator<FTContractStatsAccountTransfersReq>) => {
    const contract = req.validator.contract;
    const account = req.validator.account;
    const limit = req.validator.limit;

    const stats = await dbEvents.manyOrNone<FTContractStatsAccountTransfer>(
      sql.stats.accounts,
      { account, contract, limit },
    );

    return { data: stats };
  },
);

export default { accountTransfers, heatmap, overview, transfers };
