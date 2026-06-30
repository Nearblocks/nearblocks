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

const blockStats = v.object({
  blocks: v.nullable(v.number()),
  chunks: v.nullable(v.number()),
  date: v.string(),
  gas_fee: v.nullable(v.string()),
  gas_price: v.nullable(v.string()),
  gas_used: v.nullable(v.string()),
  shards: v.nullable(v.number()),
  total_supply: v.nullable(v.string()),
});

const txnStats = v.object({
  date: v.string(),
  meta_txns: v.nullable(v.number()),
  receipts: v.nullable(v.string()),
  txn_fee: v.nullable(v.string()),
  txn_volume: v.nullable(v.string()),
  txns: v.nullable(v.number()),
});

const addressStats = v.object({
  active_accounts: v.nullable(v.number()),
  active_contracts: v.nullable(v.number()),
  date: v.string(),
  meta_accounts: v.nullable(v.number()),
  meta_relayers: v.nullable(v.number()),
  new_contracts: v.nullable(v.number()),
});

const priceStats = v.object({
  date: v.string(),
  market_cap: v.nullable(v.string()),
  near_btc_price: v.nullable(v.string()),
  near_price: v.nullable(v.string()),
});

const signerStats = v.object({
  date: v.string(),
  gas_burnt: v.nullable(v.string()),
  signers: v.nullable(v.number()),
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
const blockStatsResponse = responseSchema(v.array(blockStats));
const txnStatsResponse = responseSchema(v.array(txnStats));
const addressStatsResponse = responseSchema(v.array(addressStats));
const priceStatsResponse = responseSchema(v.array(priceStats));
const signerStatsResponse = responseSchema(v.array(signerStats));
const tpsStatsResponse = responseSchema(v.array(tpsStats));

export type Stats = v.InferOutput<typeof stats>;
export type DailyBlockStats = v.InferOutput<typeof blockStats>;
export type DailyTxnStats = v.InferOutput<typeof txnStats>;
export type AddressStats = v.InferOutput<typeof addressStats>;
export type PriceStats = v.InferOutput<typeof priceStats>;
export type SignerStats = v.InferOutput<typeof signerStats>;
export type TpsStats = v.InferOutput<typeof tpsStats>;

export type StatsRes = v.InferOutput<typeof statsResponse>;
export type DailyBlockStatsRes = v.InferOutput<typeof blockStatsResponse>;
export type DailyTxnStatsRes = v.InferOutput<typeof txnStatsResponse>;
export type AddressStatsRes = v.InferOutput<typeof addressStatsResponse>;
export type PriceStatsRes = v.InferOutput<typeof priceStatsResponse>;
export type SignerStatsRes = v.InferOutput<typeof signerStatsResponse>;
export type TpsStatsRes = v.InferOutput<typeof tpsStatsResponse>;

export default {
  address: addressStatsResponse,
  block: blockStatsResponse,
  price: priceStatsResponse,
  signer: signerStatsResponse,
  stats: statsResponse,
  tps: tpsStatsResponse,
  txn: txnStatsResponse,
};
