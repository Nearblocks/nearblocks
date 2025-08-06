import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../common.js';

const latest = v.object({
  limit: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(10)),
    10,
  ),
});

const txns = v.object({
  after_ts: tsSchema,
  before_ts: tsSchema,
  block: v.optional(v.string()),
  cursor: cursorSchema,
  limit: limitSchema,
});

const count = v.object({
  after_ts: tsSchema,
  before_ts: tsSchema,
  block: v.optional(v.string()),
});

const txn = v.object({
  hash: v.string(),
});

const receipts = v.object({
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
export type TxnsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, latest, receipts, txn, txns };
