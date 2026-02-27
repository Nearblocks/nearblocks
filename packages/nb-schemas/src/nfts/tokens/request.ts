import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../../common.js';

const list = v.object({
  contract: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const tokenCount = v.object({
  contract: v.string(),
});

const cursor = v.object({
  contract: v.string(),
  token: v.string(),
});

const token = v.object({
  contract: v.string(),
  token: v.string(),
});

const txns = v.object({
  before_ts: tsSchema,
  contract: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
  token: v.string(),
});

const txnCount = v.object({
  before_ts: tsSchema,
  contract: v.string(),
  token: v.string(),
});

const txnCursor = v.object({
  contract: v.string(),
  index: v.string(),
  shard: v.string(),
  timestamp: v.string(),
  token: v.string(),
});

export type NFTTokenListReq = v.InferOutput<typeof list>;
export type NFTTokenCountReq = v.InferOutput<typeof tokenCount>;
export type NFTCursorReq = v.InferOutput<typeof cursor>;
export type NFTTokenReq = v.InferOutput<typeof token>;
export type NFTTokenTxnsReq = v.InferOutput<typeof txns>;
export type NFTTokenTxnsCursor = v.InferOutput<typeof txnCursor>;
export type NFTTokenTxnCountReq = v.InferOutput<typeof txnCount>;

export default {
  cursor,
  list,
  token,
  tokenCount,
  txnCount,
  txnCursor,
  txns,
};
