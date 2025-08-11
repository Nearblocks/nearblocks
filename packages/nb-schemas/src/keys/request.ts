import * as v from 'valibot';

import { cursorSchema, limitSchema } from '../common.js';

const keys = v.object({
  cursor: cursorSchema,
  key: v.string(),
  limit: limitSchema,
});

const cursor = v.object({
  account: v.string(),
  timestamp: v.string(),
});

export type AccessKeysReq = v.InferOutput<typeof keys>;
export type AccessKeysCursor = v.InferOutput<typeof cursor>;

export default { cursor, keys };
