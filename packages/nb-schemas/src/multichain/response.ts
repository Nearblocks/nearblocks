import * as v from 'valibot';

import { DestinationChain } from 'nb-types';

import { responseSchema } from '../common.js';

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const txn = v.object({
  account_id: v.string(),
  block: v.optional(block),
  block_timestamp: v.string(),
  dest_address: v.nullable(v.string()),
  dest_chain: v.nullable(v.enum(DestinationChain)),
  dest_txn: v.nullable(v.string()),
  event_index: v.number(),
  public_key: v.string(),
  receipt_id: v.string(),
  transaction_hash: v.optional(v.string()),
});

const txnCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const stats = v.object({
  accounts: v.number(),
  addresses: v.number(),
  chains: v.number(),
  txns: v.number(),
});

const txnsResponse = responseSchema(v.array(txn));
const txnCountResponse = responseSchema(txnCount);
const statsResponse = responseSchema(stats);

export type MCTxn = v.InferOutput<typeof txn>;
export type MCTxnCount = v.InferOutput<typeof txnCount>;
export type MCStats = v.InferOutput<typeof stats>;

export type MCTxnsRes = v.InferOutput<typeof txnsResponse>;
export type MCTxnCountRes = v.InferOutput<typeof txnCountResponse>;
export type MCStatsRes = v.InferOutput<typeof statsResponse>;

export default {
  count: txnCountResponse,
  stats: statsResponse,
  txns: txnsResponse,
};
