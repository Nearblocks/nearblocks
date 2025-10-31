import * as v from 'valibot';

import { responseSchema } from '../common.js';

const stats = v.object({
  avg_block_time: v.nullable(v.string()),
  change_24h: v.nullable(v.string()),
  circulating_supply: v.nullable(v.string()),
  gas_price: v.nullable(v.string()),
  market_cap: v.nullable(v.string()),
  near_btc_price: v.nullable(v.string()),
  near_price: v.nullable(v.string()),
  nodes_online: v.nullable(v.number()),
  total_supply: v.nullable(v.string()),
  total_txns: v.nullable(v.string()),
  tps: v.nullable(v.number()),
  volume_24h: v.nullable(v.string()),
});

const dailyStats = v.object({
  active_accounts: v.nullable(v.number()),
  active_contracts: v.nullable(v.number()),
  active_meta_accounts: v.nullable(v.number()),
  active_meta_relayers: v.nullable(v.number()),
  blocks: v.nullable(v.number()),
  chunks: v.nullable(v.number()),
  circulating_supply: v.nullable(v.string()),
  date: v.string(),
  gas_fee: v.nullable(v.string()),
  gas_used: v.nullable(v.string()),
  market_cap: v.nullable(v.string()),
  meta_txns: v.nullable(v.number()),
  near_btc_price: v.nullable(v.string()),
  near_price: v.nullable(v.string()),
  new_accounts: v.nullable(v.number()),
  new_contracts: v.nullable(v.number()),
  receipts: v.nullable(v.string()),
  shards: v.nullable(v.number()),
  total_supply: v.nullable(v.string()),
  txn_fee: v.nullable(v.string()),
  txn_fee_usd: v.nullable(v.string()),
  txn_volume: v.nullable(v.string()),
  txn_volume_usd: v.nullable(v.string()),
  txns: v.nullable(v.number()),
});

const shard = v.object({
  shard: v.number(),
  txns: v.number(),
});

const tpsStats = v.object({
  date: v.string(),
  shards: v.array(shard),
  txns: v.number(),
});

const statsResponse = responseSchema(stats);
const dailyStatsResponse = responseSchema(v.array(dailyStats));
const tpsStatsResponse = responseSchema(v.array(tpsStats));

export type Stats = v.InferOutput<typeof stats>;
export type DailyStats = v.InferOutput<typeof dailyStats>;
export type TpsStats = v.InferOutput<typeof tpsStats>;

export type StatsRes = v.InferOutput<typeof statsResponse>;
export type DailyStatsRes = v.InferOutput<typeof dailyStatsResponse>;
export type TpsStatsRes = v.InferOutput<typeof tpsStatsResponse>;

export default {
  daily: dailyStatsResponse,
  stats: statsResponse,
  tps: tpsStatsResponse,
};
