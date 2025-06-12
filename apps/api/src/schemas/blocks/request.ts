import * as v from 'valibot';

const blockList = v.object({
  limit: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
    25,
  ),
  next_cursor: v.optional(v.string()),
  prev_cursor: v.optional(v.string()),
});

const blockLatest = v.object({
  limit: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(10)),
    10,
  ),
});

const block = v.object({
  hash: v.string(),
});

export type BlockList = v.InferOutput<typeof blockList>;
export type BlockLatest = v.InferOutput<typeof blockLatest>;
export type Block = v.InferOutput<typeof block>;

export default { block, blockLatest, blockList };
