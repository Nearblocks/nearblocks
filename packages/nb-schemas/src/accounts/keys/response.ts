import * as v from 'valibot';

import { jsonSchema, responseSchema } from '../../common.js';

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const created = v.object({
  block: v.optional(block),
  transaction_hash: v.optional(v.string()),
});

const deleted = v.object({
  block: v.optional(block),
  transaction_hash: v.optional(v.string()),
});

const key = v.object({
  action_timestamp: v.string(),
  created,
  deleted,
  permission: v.nullable(jsonSchema),
  permission_kind: v.string(),
  public_key: v.string(),
});

const keyCount = v.object({
  count: v.string(),
});

const keysResponse = responseSchema(v.array(key));
const keyCountResponse = responseSchema(keyCount);

export type AccountKey = v.InferOutput<typeof key>;
export type AccountKeyCount = v.InferOutput<typeof keyCount>;

export type AccountKeysRes = v.InferOutput<typeof keysResponse>;
export type AccountKeyCountRes = v.InferOutput<typeof keyCountResponse>;

export default {
  count: keyCountResponse,
  keys: keysResponse,
};
