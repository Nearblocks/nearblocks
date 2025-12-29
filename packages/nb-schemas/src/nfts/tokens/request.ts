import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../../common.js';

const list = v.object({
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const cursor = v.object({
  contract: v.string(),
  token: v.string(),
});

const txns = v.object({
  before_ts: tsSchema,
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const txnCount = v.object({
  before_ts: tsSchema,
});

const txnCursor = v.object({
  contract: v.string(),
  index: v.string(),
  shard: v.string(),
  timestamp: v.string(),
  token: v.string(),
});

const contract = v.object({
  contract: v.string(),
});

const contractTxns = v.object({
  affected: v.optional(v.string()),
  before_ts: tsSchema,
  contract: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const contractTxnCount = v.object({
  affected: v.optional(v.string()),
  before_ts: tsSchema,
  contract: v.string(),
});

const contractHolders = v.object({
  contract: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const contractHolderCount = v.object({
  contract: v.string(),
});

const contractHoldersCursor = v.object({
  account: v.string(),
  quantity: v.string(),
});

export type NFTListReq = v.InferOutput<typeof list>;
export type NFTCursorReq = v.InferOutput<typeof cursor>;
export type NFTTxnsReq = v.InferOutput<typeof txns>;
export type NFTTxnsCursor = v.InferOutput<typeof txnCursor>;
export type NFTTxnCountReq = v.InferOutput<typeof txnCount>;
export type NFTContractReq = v.InferOutput<typeof contract>;
export type NFTContractTxnsReq = v.InferOutput<typeof contractTxns>;
export type NFTContractTxnCountReq = v.InferOutput<typeof contractTxnCount>;
export type NFTContractHoldersReq = v.InferOutput<typeof contractHolders>;
export type NFTContractHolderCountReq = v.InferOutput<
  typeof contractHolderCount
>;

export default {
  contract,
  contractHolderCount,
  contractHolders,
  contractHoldersCursor,
  contractTxnCount,
  contractTxns,
  cursor,
  list,
  txnCount,
  txnCursor,
  txns,
};
