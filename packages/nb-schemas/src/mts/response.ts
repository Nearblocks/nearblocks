import * as v from 'valibot';

import { EventCause } from 'nb-types';

import { responseSchema } from '../common.js';

const list = v.object({
  base_uri: v.nullable(v.string()),
  contract: v.string(),
  decimals: v.nullable(v.number()),
  holders: v.string(),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  price: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
  token: v.string(),
  transfers: v.string(),
});

const listCount = v.object({
  count: v.string(),
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

const contractHolders = v.object({
  account: v.string(),
  amount: v.string(),
  token: v.string(),
});

const contractHolderCount = v.object({
  count: v.string(),
});

const listResponse = responseSchema(v.array(list));
const listCountResponse = responseSchema(listCount);
const txnsResponse = responseSchema(v.array(txn));
const txnCountResponse = responseSchema(txnCount);
const contractTxnsResponse = responseSchema(v.array(txn));
const contractTxnCountResponse = responseSchema(txnCount);
const contractHoldersResponse = responseSchema(v.array(contractHolders));
const contractHolderCountResponse = responseSchema(contractHolderCount);

export type MTList = v.InferOutput<typeof list>;
export type MTListCount = v.InferOutput<typeof listCount>;
export type MTTxn = v.InferOutput<typeof txn>;
export type MTTxnCount = v.InferOutput<typeof txnCount>;
export type MTContractHolders = v.InferOutput<typeof contractHolders>;
export type MTContractHolderCount = v.InferOutput<typeof contractHolderCount>;

export type MTListRes = v.InferOutput<typeof listResponse>;
export type MTListCountRes = v.InferOutput<typeof listCountResponse>;
export type MTTxnsRes = v.InferOutput<typeof txnsResponse>;
export type MTTxnCountRes = v.InferOutput<typeof txnCountResponse>;
export type MTContractTxnsRes = v.InferOutput<typeof contractTxnsResponse>;
export type MTContractTxnCountRes = v.InferOutput<
  typeof contractTxnCountResponse
>;
export type MTContractHoldersRes = v.InferOutput<
  typeof contractHoldersResponse
>;
export type MTContractHolderCountRes = v.InferOutput<
  typeof contractHolderCountResponse
>;

export default {
  contractHolderCount: contractHolderCountResponse,
  contractHolders: contractHoldersResponse,
  contractTxnCount: contractTxnCountResponse,
  contractTxns: contractTxnsResponse,
  count: txnCountResponse,
  list: listResponse,
  listCount: listCountResponse,
  txns: txnsResponse,
};
