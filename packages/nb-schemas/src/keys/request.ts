import * as v from 'valibot';

import { cursorSchema, limitSchema } from '../common.js';

const keys = v.object({
  key: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const cursor = v.object({
  account: v.string(),
  timestamp: v.string(),
});

export type AccessKeysReq = v.InferOutput<typeof keys>;
export type AccessKeysCursor = v.InferOutput<typeof cursor>;

export default { cursor, keys };
