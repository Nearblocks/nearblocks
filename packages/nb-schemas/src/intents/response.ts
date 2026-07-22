import * as v from 'valibot';

import { EventCause } from 'nb-types';

import { responseSchema } from '../common.js';

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const meta = v.object({
  contract: v.string(),
  name: v.nullable(v.string()),
  spec: v.nullable(v.string()),
});

const baseMeta = v.object({
  base_uri: v.nullable(v.string()),
  contract: v.string(),
  decimals: v.nullable(v.number()),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
  token: v.string(),
});

const tokenMeta = v.object({
  contract: v.string(),
  media: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  title: v.nullable(v.string()),
  token: v.string(),
});

const txn = v.object({
  affected_account_id: v.string(),
  base_meta: v.optional(baseMeta),
  block: v.optional(block),
  block_timestamp: v.string(),
  cause: v.enum(EventCause),
  contract_account_id: v.string(),
  delta_amount: v.string(),
  event_index: v.number(),
  involved_account_id: v.nullable(v.string()),
  meta: v.optional(meta),
  price: v.nullable(v.string()),
  receipt_id: v.string(),
  shard_id: v.number(),
  token_id: v.string(),
  token_meta: v.optional(tokenMeta),
  transaction_hash: v.optional(v.string()),
});

const count = v.object({
  count: v.string(),
});

const metricPoint = v.object({
  cumulative: v.nullable(v.string()),
  daily: v.nullable(v.string()),
  date: v.string(),
});

const assetPoint = v.object({
  blockchain: v.string(),
  date: v.string(),
  swaps: v.string(),
  symbol: v.nullable(v.string()),
  token_id: v.string(),
  volume: v.nullable(v.string()),
  volume_usd: v.nullable(v.string()),
});

const blockchainPoint = v.object({
  blockchain: v.string(),
  date: v.string(),
  swaps: v.string(),
  volume: v.nullable(v.string()),
});

const overview = v.object({
  blockchains: v.string(),
  prev_day_swaps: v.nullable(v.string()),
  prev_day_volume_usd: v.nullable(v.string()),
  swaps: v.nullable(v.string()),
  tokens: v.string(),
  volume_usd: v.nullable(v.string()),
});

const txnsResponse = responseSchema(v.array(txn));
const txnCountResponse = responseSchema(count);
const volumeStatsResponse = responseSchema(v.array(metricPoint));
const swapStatsResponse = responseSchema(v.array(metricPoint));
const statsAssetsResponse = responseSchema(v.array(assetPoint));
const statsBlockchainsResponse = responseSchema(v.array(blockchainPoint));
const statsOverviewResponse = responseSchema(overview);

export type IntentsTxn = v.InferOutput<typeof txn>;
export type IntentsTxnCount = v.InferOutput<typeof count>;
export type IntentsTxnsRes = v.InferOutput<typeof txnsResponse>;
export type IntentsTxnCountRes = v.InferOutput<typeof txnCountResponse>;
export type IntentsMetricPoint = v.InferOutput<typeof metricPoint>;
export type IntentsAssetPoint = v.InferOutput<typeof assetPoint>;
export type IntentsBlockchainPoint = v.InferOutput<typeof blockchainPoint>;
export type IntentsOverview = v.InferOutput<typeof overview>;
export type IntentsVolumeStatsRes = v.InferOutput<typeof volumeStatsResponse>;
export type IntentsSwapStatsRes = v.InferOutput<typeof swapStatsResponse>;
export type IntentsStatsAssetsRes = v.InferOutput<typeof statsAssetsResponse>;
export type IntentsStatsBlockchainsRes = v.InferOutput<
  typeof statsBlockchainsResponse
>;
export type IntentsStatsOverviewRes = v.InferOutput<
  typeof statsOverviewResponse
>;

export default {
  count: txnCountResponse,
  statsAssets: statsAssetsResponse,
  statsBlockchains: statsBlockchainsResponse,
  statsOverview: statsOverviewResponse,
  swapStats: swapStatsResponse,
  txns: txnsResponse,
  volumeStats: volumeStatsResponse,
};
