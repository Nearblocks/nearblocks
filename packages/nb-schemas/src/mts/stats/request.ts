import * as v from 'valibot';

import { limitSchemaMax } from '../../common.js';

const overview = v.object({
  contract: v.string(),
  token: v.string(),
});

const heatmap = v.object({
  contract: v.string(),
  token: v.string(),
});

const transfers = v.object({
  contract: v.string(),
  limit: limitSchemaMax(365),
  token: v.string(),
});

const accountTransfers = v.object({
  account: v.string(),
  contract: v.string(),
  limit: limitSchemaMax(365),
  token: v.string(),
});

export type MTContractStatsOverviewReq = v.InferOutput<typeof overview>;
export type MTContractStatsHeatmapReq = v.InferOutput<typeof heatmap>;
export type MTContractStatsTransfersReq = v.InferOutput<typeof transfers>;
export type MTContractStatsAccountTransfersReq = v.InferOutput<
  typeof accountTransfers
>;

export default { accountTransfers, heatmap, overview, transfers };
