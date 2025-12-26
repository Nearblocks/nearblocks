import * as v from 'valibot';

import { cursorSchema, limitSchema } from '../../common.js';

const keys = v.object({
  account: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const count = v.object({
  account: v.string(),
});

const cursor = v.object({
  key: v.string(),
  timestamp: v.string(),
});

export type AccountKeysReq = v.InferOutput<typeof keys>;
export type AccountKeyCountReq = v.InferOutput<typeof count>;
export type AccountKeysCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, keys };
