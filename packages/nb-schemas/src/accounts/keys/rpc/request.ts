import * as v from 'valibot';

import { cursorSchema, limitSchema } from '../../../common.js';

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
});

export type AccountRpcKeysReq = v.InferOutput<typeof keys>;
export type AccountRpcKeyCountReq = v.InferOutput<typeof count>;
export type AccountRpcKeysCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, keys };
