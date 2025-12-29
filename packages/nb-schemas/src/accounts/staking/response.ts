import * as v from 'valibot';

import { StakingEventType } from 'nb-types';

import { responseSchema } from '../../common.js';

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const txn = v.object({
  account: v.string(),
  amount: v.string(),
  block: v.optional(block),
  block_timestamp: v.string(),
  contract: v.string(),
  index_in_chunk: v.number(),
  receipt_id: v.string(),
  shard_id: v.number(),
  transaction_hash: v.optional(v.string()),
  type: v.enum(StakingEventType),
});

const txnCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const txnsResponse = responseSchema(
  v.array(v.omit(txn, ['shard_id', 'index_in_chunk'])),
);
const txnCountResponse = responseSchema(v.omit(txnCount, ['cost']));

export type AccountStakingTxn = v.InferOutput<typeof txn>;
export type AccountStakingTxnCount = v.InferOutput<typeof txnCount>;

export type AccountStakingTxnsRes = v.InferOutput<typeof txnsResponse>;
export type AccountStakingTxnCountRes = v.InferOutput<typeof txnCountResponse>;

export default {
  count: txnCountResponse,
  txns: txnsResponse,
};
