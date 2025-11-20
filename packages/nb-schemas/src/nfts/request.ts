import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../common.js';

export const NFTListSort = {
  HOLDERS: 'holders',
  NAME: 'name',
  TOKENS: 'tokens',
  TRANSFERS: 'transfers_24h',
} as const;

export const NFTListOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

const list = v.object({
  limit: limitSchema,
  next: cursorSchema,
  order: v.optional(v.enum(NFTListOrder), 'desc'),
  prev: cursorSchema,
  search: v.optional(v.string()),
  sort: v.optional(v.enum(NFTListSort), 'transfers_24h'),
});

const count = v.object({
  search: v.optional(v.string()),
});

const cursor = v.object({
  contract: v.string(),
  sort: v.enum(NFTListSort),
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
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
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
export type NFTCountReq = v.InferOutput<typeof count>;
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
  count,
  cursor,
  list,
  txnCount,
  txnCursor,
  txns,
};
