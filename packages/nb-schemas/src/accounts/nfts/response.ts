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

const txnsResponse = responseSchema(v.array(txn));
const txnCountResponse = responseSchema(txnCount);

export type AccountNFTTxn = v.InferOutput<typeof txn>;
export type AccountNFTTxnCount = v.InferOutput<typeof txnCount>;

export type AccountNFTTxnsRes = v.InferOutput<typeof txnsResponse>;
export type AccountNFTTxnCountRes = v.InferOutput<typeof txnCountResponse>;

export default {
  count: txnCountResponse,
  txns: txnsResponse,
};
