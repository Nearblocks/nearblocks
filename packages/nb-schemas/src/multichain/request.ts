import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../common.js';

const txns = v.object({
  account: v.optional(v.string()),
  before_ts: tsSchema,
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const count = v.object({
  account: v.optional(v.string()),
  before_ts: tsSchema,
});

const cursor = v.object({
  index: v.number(),
  timestamp: v.string(),
});

export type MCTxnsReq = v.InferOutput<typeof txns>;
export type MCTxnCountReq = v.InferOutput<typeof count>;
export type MCTxnsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, txns };
