import * as v from 'valibot';

import { EventCause } from 'nb-types';

import { responseSchema } from '../../common.js';

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const meta = v.object({
  base_uri: v.nullable(v.string()),
  contract: v.string(),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
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
  block: v.optional(block),
  block_timestamp: v.string(),
  cause: v.enum(EventCause),
  contract_account_id: v.string(),
  delta_amount: v.string(),
  event_index: v.number(),
  involved_account_id: v.nullable(v.string()),
  meta: v.optional(meta),
  receipt_id: v.string(),
  shard_id: v.number(),
  token_id: v.string(),
  token_meta: v.optional(tokenMeta),
  transaction_hash: v.optional(v.string()),
});

const txnCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const contractTxn = v.object({
  affected_account_id: v.string(),
  block: v.optional(block),
  block_timestamp: v.string(),
  cause: v.enum(EventCause),
  contract_account_id: v.string(),
  delta_amount: v.string(),
  event_index: v.number(),
  involved_account_id: v.nullable(v.string()),
  meta: v.optional(meta),
  receipt_id: v.string(),
  shard_id: v.number(),
  token_id: v.string(),
  token_meta: v.optional(tokenMeta),
  transaction_hash: v.optional(v.string()),
});

const contractTxnCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const txnsResponse = responseSchema(
  v.array(v.omit(txn, ['block_timestamp', 'shard_id', 'event_index'])),
);
const txnCountResponse = responseSchema(v.omit(txnCount, ['cost']));
const contractTxnsResponse = responseSchema(
  v.array(v.omit(txn, ['block_timestamp', 'shard_id', 'event_index'])),
);
const contractTxnCountResponse = responseSchema(v.omit(txnCount, ['cost']));

export type NFTTxn = v.InferOutput<typeof txn>;
export type NFTTxnCount = v.InferOutput<typeof txnCount>;
export type NFTContractTxn = v.InferOutput<typeof contractTxn>;
export type NFTContractTxnCount = v.InferOutput<typeof contractTxnCount>;

export type NFTTxnsRes = v.InferOutput<typeof txnsResponse>;
export type NFTTxnCountRes = v.InferOutput<typeof txnCountResponse>;
export type NFTContractTxnsRes = v.InferOutput<typeof contractTxnsResponse>;
export type NFTContractTxnCountRes = v.InferOutput<
  typeof contractTxnCountResponse
>;

export default {
  contractTxnCount: contractTxnCountResponse,
  contractTxns: contractTxnsResponse,
  count: txnCountResponse,
  txns: txnsResponse,
};
