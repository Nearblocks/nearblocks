import * as v from 'valibot';

import { responseSchema } from '../../common.js';

const overview = v.object({
  active_days: v.string(),
  first_day: v.string(),
  last_day: v.string(),
  longest_streak: v.object({
    days: v.string(),
    end: v.string(),
    start: v.string(),
  }),
  total_transfers: v.string(),
  unique_days: v.string(),
});

const transfer = v.object({
  contract: v.string(),
  date: v.string(),
  token: v.string(),
  transfers_amount: v.string(),
  transfers_count: v.string(),
  unique_accounts: v.string(),
  unique_receivers: v.string(),
  unique_senders: v.string(),
});

const heatmap = v.object({
  contract: v.string(),
  date: v.string(),
  token: v.string(),
  transfers_count: v.string(),
  unique_receivers: v.string(),
  unique_senders: v.string(),
});

const accountTransfer = v.object({
  account: v.string(),
  amount_in: v.string(),
  amount_out: v.string(),
  contract: v.string(),
  date: v.string(),
  token: v.string(),
  transfers: v.string(),
  unique_address_in: v.string(),
  unique_address_out: v.string(),
});

const overviewResponse = responseSchema(overview);
const transfersResponse = responseSchema(v.array(transfer));
const heatmapResponse = responseSchema(v.array(heatmap));
const accountTransfersResponse = responseSchema(v.array(accountTransfer));

export type MTContractStatsOverview = v.InferOutput<typeof overview>;
export type MTContractStatsTransfer = v.InferOutput<typeof transfer>;
export type MTContractStatsHeatmap = v.InferOutput<typeof heatmap>;
export type MTContractStatsAccountTransfer = v.InferOutput<
  typeof accountTransfer
>;

export type MTContractStatsOverviewRes = v.InferOutput<typeof overviewResponse>;
export type MTContractStatsTransfersRes = v.InferOutput<
  typeof transfersResponse
>;
export type MTContractStatsHeatmapRes = v.InferOutput<typeof heatmapResponse>;
export type MTContractStatsAccountTransfersRes = v.InferOutput<
  typeof accountTransfersResponse
>;

export default {
  accountTransfers: accountTransfersResponse,
  heatmap: heatmapResponse,
  overview: overviewResponse,
  transfers: transfersResponse,
};
