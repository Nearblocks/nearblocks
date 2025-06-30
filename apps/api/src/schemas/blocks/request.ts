import * as v from 'valibot';

const latest = v.object({
  limit: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(10)),
    10,
  ),
});

const blocks = v.object({
  cursor: v.optional(v.string()),
  limit: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
    25,
  ),
});

const block = v.object({
  hash: v.string(),
});

const cursor = v.object({
  block_timestamp: v.string(),
});

export type BlocksReq = v.InferOutput<typeof blocks>;
export type BlocksLatestReq = v.InferOutput<typeof latest>;
export type BlockReq = v.InferOutput<typeof block>;
export type BlockCursorReq = v.InferOutput<typeof cursor>;

export default { block, blocks, cursor, latest };
