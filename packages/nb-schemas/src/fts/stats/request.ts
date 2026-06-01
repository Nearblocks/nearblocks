import * as v from 'valibot';

import { limitSchemaMax } from '../../common.js';

const overview = v.object({
  contract: v.string(),
});

const heatmap = v.object({
  contract: v.string(),
});

const transfers = v.object({
  contract: v.string(),
  limit: limitSchemaMax(365),
});

const accountTransfers = v.object({
  account: v.string(),
  contract: v.string(),
  limit: limitSchemaMax(365),
});

export type FTContractStatsOverviewReq = v.InferOutput<typeof overview>;
export type FTContractStatsHeatmapReq = v.InferOutput<typeof heatmap>;
export type FTContractStatsTransfersReq = v.InferOutput<typeof transfers>;
export type FTContractStatsAccountTransfersReq = v.InferOutput<
  typeof accountTransfers
>;

export default { accountTransfers, heatmap, overview, transfers };
