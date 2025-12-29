import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../../common.js';

const txns = v.object({
  account: v.string(),
  before_ts: tsSchema,
  contract: v.optional(v.string()),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
  type: v.optional(v.string()),
});

const count = v.object({
  account: v.string(),
  before_ts: tsSchema,
  contract: v.optional(v.string()),
  type: v.optional(v.string()),
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
});

export type AccountStakingTxnsReq = v.InferOutput<typeof txns>;
export type AccountStakingTxnCountReq = v.InferOutput<typeof count>;
export type AccountStakingTxnsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, txns };
