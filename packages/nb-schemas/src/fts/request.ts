import * as v from 'valibot';

import { cursorSchema, limitSchema } from '../common.js';

const txns = v.object({
  cursor: cursorSchema,
  limit: limitSchema,
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
  type: v.number(),
});

export type FTTxnsReq = v.InferOutput<typeof txns>;
export type FTTxnsCursor = v.InferOutput<typeof cursor>;

export default { cursor, txns };
