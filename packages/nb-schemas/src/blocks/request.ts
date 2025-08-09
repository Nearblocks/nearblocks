import * as v from 'valibot';

import { cursorSchema, limitSchema } from '../common.js';

const latest = v.object({
  limit: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(10)),
    10,
  ),
});

const blocks = v.object({
  cursor: cursorSchema,
  limit: limitSchema,
});

const block = v.object({
  hash: v.string(),
});

const cursor = v.object({
  timestamp: v.string(),
});

export type BlocksLatestReq = v.InferOutput<typeof latest>;
export type BlocksReq = v.InferOutput<typeof blocks>;
export type BlockReq = v.InferOutput<typeof block>;
export type BlocksCursor = v.InferOutput<typeof cursor>;

export default { block, blocks, cursor, latest };
