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

export type StakingTxnsReq = v.InferOutput<typeof txns>;
export type StakingTxnCountReq = v.InferOutput<typeof count>;
export type StakingTxnsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, txns };
