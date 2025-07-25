import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../common.js';

const txns = v.object({
  account: v.optional(v.string()),
  after_ts: tsSchema,
  before_ts: tsSchema,
  cursor: cursorSchema,
  limit: limitSchema,
});

const count = v.object({
  account: v.optional(v.string()),
  after_ts: tsSchema,
  before_ts: tsSchema,
});

const cursor = v.object({
  index: v.number(),
  timestamp: v.string(),
});

export type McTxnsReq = v.InferOutput<typeof txns>;
export type McTxnsCountReq = v.InferOutput<typeof count>;
export type McTxnsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, txns };
