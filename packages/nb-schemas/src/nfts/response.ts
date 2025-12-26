import * as v from 'valibot';

import { EventCause } from 'nb-types';

import { responseSchema } from '../common.js';

const list = v.object({
  base_uri: v.nullable(v.string()),
  contract: v.string(),
  holders: v.string(),
  icon: v.nullable(v.string()),
  name: v.string(),
  reference: v.nullable(v.string()),
  symbol: v.string(),
  tokens: v.string(),
  transfers_24h: v.string(),
});

const count = v.object({
  count: v.string(),
});

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

const contract = v.object({
  base_uri: v.nullable(v.string()),
  contract: v.string(),
  description: v.nullable(v.string()),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  reference_hash: v.nullable(v.string()),
  spec: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
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

const contractHolders = v.object({
  account: v.string(),
  quantity: v.string(),
});

const contractHolderCount = v.object({
  count: v.string(),
});

const listResponse = responseSchema(v.array(list));
const countResponse = responseSchema(count);
const txnsResponse = responseSchema(
  v.array(v.omit(txn, ['shard_id', 'event_index'])),
);
const txnCountResponse = responseSchema(v.omit(txnCount, ['cost']));
const contractResponse = responseSchema(contract);
const contractTxnsResponse = responseSchema(
  v.array(v.omit(txn, ['shard_id', 'event_index'])),
);
const contractTxnCountResponse = responseSchema(v.omit(txnCount, ['cost']));
const contractHoldersResponse = responseSchema(v.array(contractHolders));
const contractHolderCountResponse = responseSchema(contractHolderCount);

export type NFTList = v.InferOutput<typeof list>;
export type NFTCount = v.InferOutput<typeof count>;
export type NFTTxn = v.InferOutput<typeof txn>;
export type NFTTxnCount = v.InferOutput<typeof txnCount>;
export type NFTContract = v.InferOutput<typeof contract>;
export type NFTContractTxn = v.InferOutput<typeof contractTxn>;
export type NFTContractTxnCount = v.InferOutput<typeof contractTxnCount>;
export type NFTContractHolders = v.InferOutput<typeof contractHolders>;
export type NFTContractHolderCount = v.InferOutput<typeof contractHolderCount>;

export type NFTListRes = v.InferOutput<typeof listResponse>;
export type NFTCountRes = v.InferOutput<typeof countResponse>;
export type NFTTxnsRes = v.InferOutput<typeof txnsResponse>;
export type NFTTxnCountRes = v.InferOutput<typeof txnCountResponse>;
export type NFTContractRes = v.InferOutput<typeof contractResponse>;
export type NFTContractTxnsRes = v.InferOutput<typeof contractTxnsResponse>;
export type NFTContractTxnCountRes = v.InferOutput<
  typeof contractTxnCountResponse
>;
export type NFTContractHoldersRes = v.InferOutput<
  typeof contractHoldersResponse
>;
export type NFTContractHolderCountRes = v.InferOutput<
  typeof contractHolderCountResponse
>;

export default {
  contract: contractResponse,
  contractHolderCount: contractHolderCountResponse,
  contractHolders: contractHoldersResponse,
  contractTxnCount: contractTxnCountResponse,
  contractTxns: contractTxnsResponse,
  count: countResponse,
  list: listResponse,
  txnCount: txnCountResponse,
  txns: txnsResponse,
};
