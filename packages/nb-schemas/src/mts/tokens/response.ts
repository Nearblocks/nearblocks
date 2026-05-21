import * as v from 'valibot';

import { EventCause } from 'nb-types';

import { responseSchema } from '../../common.js';

const list = v.object({
  base_uri: v.nullable(v.string()),
  contract: v.string(),
  copies: v.nullable(v.number()),
  decimals: v.nullable(v.number()),
  icon: v.nullable(v.string()),
  media: v.nullable(v.string()),
  name: v.nullable(v.string()),
  owner: v.nullable(v.string()),
  price: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
  title: v.nullable(v.string()),
  token: v.string(),
});

const count = v.object({
  count: v.string(),
});

const token = v.object({
  ...list.entries,
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
  receipt_id: v.string(),
  shard_id: v.number(),
  token_id: v.string(),
  token_meta: v.optional(tokenMeta),
  transaction_hash: v.optional(v.string()),
});

const txnCount = v.object({
  count: v.string(),
});

const holder = v.object({
  account: v.string(),
  amount: v.string(),
  token: v.string(),
});

const holderCount = v.object({
  count: v.string(),
});

const listResponse = responseSchema(v.array(list));
const countResponse = responseSchema(count);
const tokenResponse = responseSchema(token);
const txnsResponse = responseSchema(v.array(txn));
const txnCountResponse = responseSchema(txnCount);
const holdersResponse = responseSchema(v.array(holder));
const holderCountResponse = responseSchema(holderCount);

export type MTTokenList = v.InferOutput<typeof list>;
export type MTTokenCount = v.InferOutput<typeof count>;
export type MTToken = v.InferOutput<typeof token>;
export type MTTokenTxn = v.InferOutput<typeof txn>;
export type MTTokenTxnCount = v.InferOutput<typeof txnCount>;
export type MTTokenHolder = v.InferOutput<typeof holder>;
export type MTTokenHolderCount = v.InferOutput<typeof holderCount>;

export type MTTokenListRes = v.InferOutput<typeof listResponse>;
export type MTTokenCountRes = v.InferOutput<typeof countResponse>;
export type MTTokenRes = v.InferOutput<typeof tokenResponse>;
export type MTTokenTxnsRes = v.InferOutput<typeof txnsResponse>;
export type MTTokenTxnCountRes = v.InferOutput<typeof txnCountResponse>;
export type MTTokenHoldersRes = v.InferOutput<typeof holdersResponse>;
export type MTTokenHolderCountRes = v.InferOutput<typeof holderCountResponse>;

export default {
  count: countResponse,
  holderCount: holderCountResponse,
  holders: holdersResponse,
  list: listResponse,
  token: tokenResponse,
  txnCount: txnCountResponse,
  txns: txnsResponse,
};
