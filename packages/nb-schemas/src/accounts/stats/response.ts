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
  txns: v.string(),
  unique_days: v.string(),
});

const txn = v.object({
  account: v.string(),
  date: v.string(),
  txns: v.string(),
  unique_address_in: v.string(),
  unique_address_out: v.string(),
});

const balance = v.object({
  account: v.string(),
  amount: v.string(),
  amount_staked: v.string(),
  date: v.string(),
  storage_usage: v.string(),
});

const near = v.object({
  account: v.string(),
  amount_in: v.string(),
  amount_out: v.string(),
  date: v.string(),
});

const ft = v.object({
  account: v.string(),
  contracts: v.string(),
  date: v.string(),
  transfers: v.string(),
  unique_address_in: v.string(),
  unique_address_out: v.string(),
});

const overviewResponse = responseSchema(overview);
const txnResponse = responseSchema(v.array(txn));
const balanceResponse = responseSchema(v.array(balance));
const nearResponse = responseSchema(v.array(near));
const ftResponse = responseSchema(v.array(ft));

export type AccountStatsOverview = v.InferOutput<typeof overview>;
export type AccountTxnStats = v.InferOutput<typeof txn>;
export type AccountBalanceStats = v.InferOutput<typeof balance>;
export type AccountNearStats = v.InferOutput<typeof near>;
export type AccountFTStats = v.InferOutput<typeof ft>;

export type AccountStatsOverviewRes = v.InferOutput<typeof overviewResponse>;
export type AccountTxnStatsRes = v.InferOutput<typeof txnResponse>;
export type AccountBalanceStatsRes = v.InferOutput<typeof balanceResponse>;
export type AccountNearStatsRes = v.InferOutput<typeof nearResponse>;
export type AccountFTStatsRes = v.InferOutput<typeof ftResponse>;

export default {
  balance: balanceResponse,
  fts: ftResponse,
  near: nearResponse,
  overview: overviewResponse,
  txns: txnResponse,
};
