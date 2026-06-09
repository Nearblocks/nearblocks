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

export type IntentsTxnsReq = v.InferOutput<typeof txns>;
export type IntentsTxnCountReq = v.InferOutput<typeof count>;
export type IntentsTxnsCursor = v.InferOutput<typeof cursor>;

export default {
  count,
  cursor,
  txns,
};
