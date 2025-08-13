import * as v from 'valibot';

import { EventCause, EventStandard } from 'nb-types';

import { responseSchema } from '../common.js';

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const txn = v.object({
  affected_account_id: v.string(),
  block: v.optional(block),
  block_timestamp: v.string(),
  cause: v.enum(EventCause),
  contract_account_id: v.string(),
  delta_amount: v.string(),
  event_index: v.number(),
  event_type: v.number(),
  involved_account_id: v.nullable(v.string()),
  receipt_id: v.string(),
  shard_id: v.number(),
  standard: v.enum(EventStandard),
  transaction_hash: v.optional(v.string()),
});

const txnCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const txnsResponse = responseSchema(
  v.array(
    v.omit(txn, ['block_timestamp', 'shard_id', 'event_type', 'event_index']),
  ),
);
const txnCountResponse = responseSchema(v.omit(txnCount, ['cost']));

export type FTTxn = v.InferOutput<typeof txn>;
export type FTTxnCount = v.InferOutput<typeof txnCount>;

export type FTTxnsRes = v.InferOutput<typeof txnsResponse>;
export type FTTxnCountRes = v.InferOutput<typeof txnCountResponse>;

export default {
  count: txnCountResponse,
  txns: txnsResponse,
};
