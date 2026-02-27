import * as v from 'valibot';

import { EventCause } from 'nb-types';

import { responseSchema } from '../../common.js';

const list = v.object({
  contract: v.string(),
  media: v.nullable(v.string()),
  owner: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  title: v.nullable(v.string()),
  token: v.string(),
});

const count = v.object({
  count: v.string(),
});

const token = v.object({
  ...list.entries,
  copies: v.nullable(v.number()),
  description: v.nullable(v.string()),
  expires_at: v.nullable(v.string()),
  extra: v.nullable(v.string()),
  issued_at: v.nullable(v.string()),
  starts_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

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
  involved_account_id: v.nullable(v.string()),
  receipt_id: v.string(),
  shard_id: v.number(),
  token_id: v.string(),
  transaction_hash: v.optional(v.string()),
});

const txnCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const listResponse = responseSchema(v.array(list));
const countResponse = responseSchema(count);
const tokenResponse = responseSchema(token);
const txnsResponse = responseSchema(v.array(txn));
const txnCountResponse = responseSchema(txnCount);

export type NFTTokenList = v.InferOutput<typeof list>;
export type NFTTokenCount = v.InferOutput<typeof count>;
export type NFTToken = v.InferOutput<typeof token>;
export type NFTTokenTxn = v.InferOutput<typeof txn>;
export type NFTTokenTxnCount = v.InferOutput<typeof txnCount>;

export type NFTTokenListRes = v.InferOutput<typeof listResponse>;
export type NFTTokenCountRes = v.InferOutput<typeof countResponse>;
export type NFTTokenRes = v.InferOutput<typeof tokenResponse>;
export type NFTTokenTxnsRes = v.InferOutput<typeof txnsResponse>;
export type NFTTokenTxnCountRes = v.InferOutput<typeof txnCountResponse>;

export default {
  count: countResponse,
  list: listResponse,
  token: tokenResponse,
  txnCount: txnCountResponse,
  txns: txnsResponse,
};
