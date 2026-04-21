import * as v from 'valibot';

import { limitSchemaMax } from '../../common.js';

const overview = v.object({
  account: v.string(),
});

const heatmap = v.object({
  account: v.string(),
});

const txns = v.object({
  account: v.string(),
  limit: limitSchemaMax(365),
});

const balance = v.object({
  account: v.string(),
  limit: limitSchemaMax(365),
});

const near = v.object({
  account: v.string(),
  limit: limitSchemaMax(365),
});

const fts = v.object({
  account: v.string(),
  limit: limitSchemaMax(365),
});

export type AccountStatsOverviewReq = v.InferOutput<typeof overview>;
export type AccountTxnsHeatmapReq = v.InferOutput<typeof heatmap>;
export type AccountTxnStatsReq = v.InferOutput<typeof txns>;
export type AccountBalanceStatsReq = v.InferOutput<typeof balance>;
export type AccountNearStatsReq = v.InferOutput<typeof near>;
export type AccountFTStatsReq = v.InferOutput<typeof fts>;

export default { balance, fts, heatmap, near, overview, txns };
