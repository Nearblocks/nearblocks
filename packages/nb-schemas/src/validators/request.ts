import * as v from 'valibot';

import { cursorSchema, limit, limitSchema } from '../common.js';

const list = v.object({
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const cursor = v.object({
  account_id: v.string(),
  stake: v.nullable(v.string()),
});

const detail = v.object({
  account: v.string(),
});

const blocks = v.object({
  account: v.string(),
  limit: v.optional(limit(365)),
});

const chunks = v.object({
  account: v.string(),
  limit: v.optional(limit(365)),
});

export type ValidatorsListReq = v.InferOutput<typeof list>;
export type ValidatorCursor = v.InferOutput<typeof cursor>;
export type ValidatorDetailReq = v.InferOutput<typeof detail>;
export type ValidatorBlockStatsReq = v.InferOutput<typeof blocks>;
export type ValidatorChunkStatsReq = v.InferOutput<typeof chunks>;

export default { blocks, chunks, cursor, detail, list };
