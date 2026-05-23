import * as v from 'valibot';

import {
  cursorSchema,
  limitSchema,
  limitSchemaMax,
  tsSchema,
} from '../../common.js';

const list = v.object({
  contract: v.string(),
  limit: limitSchemaMax(36),
  next: cursorSchema,
  prev: cursorSchema,
  type: v.optional(v.picklist(['ft', 'nft'])),
});

const tokenCount = v.object({
  contract: v.string(),
  type: v.optional(v.picklist(['ft', 'nft'])),
});

const cursor = v.object({
  contract: v.string(),
  price: v.optional(v.nullable(v.string())),
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
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
});

const tokenHolders = v.object({
  contract: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
  token: v.string(),
});

const tokenHolderCount = v.object({
  contract: v.string(),
  token: v.string(),
});

const tokenHoldersCursor = v.object({
  account: v.string(),
  amount: v.string(),
});

export type MTTokenListReq = v.InferOutput<typeof list>;
export type MTTokenCountReq = v.InferOutput<typeof tokenCount>;
export type MTTokenCursorReq = v.InferOutput<typeof cursor>;
export type MTTokenReq = v.InferOutput<typeof token>;
export type MTTokenTxnsReq = v.InferOutput<typeof txns>;
export type MTTokenTxnsCursor = v.InferOutput<typeof txnCursor>;
export type MTTokenTxnCountReq = v.InferOutput<typeof txnCount>;
export type MTTokenHoldersReq = v.InferOutput<typeof tokenHolders>;
export type MTTokenHolderCountReq = v.InferOutput<typeof tokenHolderCount>;
export type MTTokenHoldersCursor = v.InferOutput<typeof tokenHoldersCursor>;

export default {
  cursor,
  list,
  token,
  tokenCount,
  tokenHolderCount,
  tokenHolders,
  tokenHoldersCursor,
  txnCount,
  txnCursor,
  txns,
};
