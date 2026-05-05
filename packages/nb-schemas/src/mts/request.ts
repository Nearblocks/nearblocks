import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../common.js';

const txns = v.object({
  before_ts: tsSchema,
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const count = v.object({
  before_ts: tsSchema,
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
});

export type MTTxnsReq = v.InferOutput<typeof txns>;
export type MTTxnCountReq = v.InferOutput<typeof count>;
export type MTTxnsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, txns };
