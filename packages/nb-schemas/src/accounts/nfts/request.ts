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
  token: v.optional(v.string()),
});

const count = v.object({
  account: v.string(),
  after_ts: tsSchema,
  before_ts: tsSchema,
  cause: v.optional(v.string()),
  contract: v.optional(v.string()),
  involved: v.optional(v.string()),
  token: v.optional(v.string()),
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
});

export type AccountNFTTxnsReq = v.InferOutput<typeof txns>;
export type AccountNFTTxnCountReq = v.InferOutput<typeof count>;
export type AccountNFTTxnsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, txns };
