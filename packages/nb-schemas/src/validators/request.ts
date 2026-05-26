import * as v from 'valibot';

import { cursorSchema, limitSchema } from '../common.js';

const list = v.object({
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const cursor = v.object({
  account_id: v.string(),
  stake: v.nullable(v.string()),
});

export type ValidatorsListReq = v.InferOutput<typeof list>;
export type ValidatorCursor = v.InferOutput<typeof cursor>;

export default { cursor, list };
