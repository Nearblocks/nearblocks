import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../common.js';

export const FTListSort = {
  CHANGE: 'change_24h',
  HOLDERS: 'holders',
  MARKET_CAP: 'market_cap',
  NAME: 'name',
  ONCHAIN_MARKET_CAP: 'onchain_market_cap',
  PRICE: 'price',
  VOLUME: 'volume_24h',
} as const;

export const FTListOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

const list = v.object({
  limit: limitSchema,
  next: cursorSchema,
  order: v.optional(v.enum(FTListOrder), 'desc'),
  prev: cursorSchema,
  search: v.optional(v.string()),
  sort: v.optional(v.enum(FTListSort), 'onchain_market_cap'),
});

const count = v.object({
  search: v.optional(v.string()),
});

const cursor = v.object({
  contract: v.string(),
  sort: v.enum(FTListSort),
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

const txnsCursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
  type: v.number(),
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
  amount: v.string(),
});

export type FTListReq = v.InferOutput<typeof list>;
export type FTCountReq = v.InferOutput<typeof count>;
export type FTCursor = v.InferOutput<typeof cursor>;
export type FTTxnsReq = v.InferOutput<typeof txns>;
export type FTTxnsCursor = v.InferOutput<typeof txnsCursor>;
export type FTTxnCountReq = v.InferOutput<typeof txnCount>;
export type FTContractReq = v.InferOutput<typeof contract>;
export type FTContractTxnsReq = v.InferOutput<typeof contractTxns>;
export type FTContractTxnCountReq = v.InferOutput<typeof contractTxnCount>;
export type FTContractHoldersReq = v.InferOutput<typeof contractHolders>;
export type FTContractHolderCountReq = v.InferOutput<
  typeof contractHolderCount
>;
export type FTContractHoldersCursorReq = v.InferOutput<
  typeof contractHoldersCursor
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
  txns,
  txnsCursor,
};
