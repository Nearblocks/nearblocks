import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../common.js';

const receipts = v.object({
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

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
});

export type ReceiptsReq = v.InferOutput<typeof receipts>;
export type ReceiptCountReq = v.InferOutput<typeof count>;
export type ReceiptsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, receipts };
