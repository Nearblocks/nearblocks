import * as v from 'valibot';

import { jsonSchema, responseSchema } from '../common.js';

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
  account_id: v.string(),
  action_timestamp: v.string(),
  created,
  deleted,
  permission: v.nullable(jsonSchema),
  permission_kind: v.string(),
  public_key: v.string(),
});

const keysResponse = responseSchema(v.array(key));

export type AccessKey = v.InferOutput<typeof key>;

export type AccessKeyRes = v.InferOutput<typeof keysResponse>;

export default {
  keys: keysResponse,
};
