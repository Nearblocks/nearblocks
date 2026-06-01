import type {
  MTContractStatsAccountTransfer,
  MTContractStatsAccountTransfersReq,
  MTContractStatsHeatmap,
  MTContractStatsHeatmapReq,
  MTContractStatsOverview,
  MTContractStatsOverviewReq,
  MTContractStatsTransfer,
  MTContractStatsTransfersReq,
} from 'nb-schemas';
import response from 'nb-schemas/dist/mts/stats/response.js';

import dayjs from '#libs/dayjs';
import { dbEvents } from '#libs/pgp';
import { msToNsTime } from '#libs/utils';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/mts';

const overview = responseHandler(
  response.overview,
  async (req: RequestValidator<MTContractStatsOverviewReq>) => {
    const contract = req.validator.contract;
    const token = req.validator.token;

    const stats = await dbEvents.oneOrNone<MTContractStatsOverview>(
      sql.stats.overview,
      { contract, token },
    );

    return { data: stats?.first_day ? stats : null };
  },
);

const heatmap = responseHandler(
  response.heatmap,
  async (req: RequestValidator<MTContractStatsHeatmapReq>) => {
    const contract = req.validator.contract;
    const token = req.validator.token;
    const start = msToNsTime(
      dayjs.utc().subtract(11, 'months').startOf('month').valueOf(),
    );

    const stats = await dbEvents.manyOrNone<MTContractStatsHeatmap>(
      sql.stats.heatmap,
      { contract, start, token },
    );

    return { data: stats };
  },
);

const transfers = responseHandler(
  response.transfers,
  async (req: RequestValidator<MTContractStatsTransfersReq>) => {
    const contract = req.validator.contract;
    const token = req.validator.token;
    const limit = req.validator.limit;

    const stats = await dbEvents.manyOrNone<MTContractStatsTransfer>(
      sql.stats.transfers,
      { contract, limit, token },
    );

    return { data: stats };
  },
);

const accountTransfers = responseHandler(
  response.accountTransfers,
  async (req: RequestValidator<MTContractStatsAccountTransfersReq>) => {
    const contract = req.validator.contract;
    const token = req.validator.token;
    const account = req.validator.account;
    const limit = req.validator.limit;

    const stats = await dbEvents.manyOrNone<MTContractStatsAccountTransfer>(
      sql.stats.accounts,
      { account, contract, limit, token },
    );

    return { data: stats };
  },
);

export default { accountTransfers, heatmap, overview, transfers };
