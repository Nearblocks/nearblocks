import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../../common.js';

const txns = v.object({
  account: v.string(),
  after_ts: tsSchema,
  before_ts: tsSchema,
  cause: v.optional(v.string()),
  contract: v.optional(v.string()),
  cursor: cursorSchema,
  involved: v.optional(v.string()),
  limit: limitSchema,
});

const count = v.object({
  account: v.string(),
  after_ts: tsSchema,
  before_ts: tsSchema,
  cause: v.optional(v.string()),
  contract: v.optional(v.string()),
  involved: v.optional(v.string()),
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
  type: v.number(),
});

export type AccountFTTxnsReq = v.InferOutput<typeof txns>;
export type AccountFTTxnCountReq = v.InferOutput<typeof count>;
export type AccountFTTxnsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, txns };
