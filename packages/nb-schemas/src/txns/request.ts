import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../common.js';

const latest = v.object({
  limit: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(10)),
    10,
  ),
});

const txns = v.object({
  before_ts: tsSchema,
  block: v.optional(v.string()),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const count = v.object({
  before_ts: tsSchema,
  block: v.optional(v.string()),
});

const txn = v.object({
  hash: v.string(),
});

const receipts = v.object({
  hash: v.string(),
});

const fts = v.object({
  hash: v.string(),
});

const nfts = v.object({
  hash: v.string(),
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
});

export type TxnsLatestReq = v.InferOutput<typeof latest>;
export type TxnsReq = v.InferOutput<typeof txns>;
export type TxnCountReq = v.InferOutput<typeof count>;
export type TxnReq = v.InferOutput<typeof txn>;
export type TxnReceiptsReq = v.InferOutput<typeof receipts>;
export type TxnFTsReq = v.InferOutput<typeof fts>;
export type TxnNFTsReq = v.InferOutput<typeof nfts>;
export type TxnsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, fts, latest, nfts, receipts, txn, txns };
