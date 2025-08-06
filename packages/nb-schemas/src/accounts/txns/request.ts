import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../../common.js';

const txns = v.object({
  account: v.string(),
  after_ts: tsSchema,
  before_ts: tsSchema,
  cursor: cursorSchema,
  limit: limitSchema,
  receiver: v.optional(v.string()),
  signer: v.optional(v.string()),
});

const count = v.object({
  account: v.string(),
  after_ts: tsSchema,
  before_ts: tsSchema,
  receiver: v.optional(v.string()),
  signer: v.optional(v.string()),
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
});

export type AccountTxnsReq = v.InferOutput<typeof txns>;
export type AccountTxnCountReq = v.InferOutput<typeof count>;
export type AccountTxnsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, txns };
