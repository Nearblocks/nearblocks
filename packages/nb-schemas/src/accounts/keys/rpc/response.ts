import * as v from 'valibot';

import { responseSchema } from '../../../common.js';

const permission = v.object({
  allowance: v.nullable(v.string()),
  methodNames: v.array(v.string()),
  receiverId: v.string(),
});

const key = v.object({
  nonce: v.string(),
  permission: v.nullable(permission),
  permission_kind: v.string(),
  public_key: v.string(),
});

const keyCount = v.object({
  count: v.string(),
});

const keysResponse = responseSchema(v.array(key));
const keyCountResponse = responseSchema(keyCount);

export type AccountRpcKey = v.InferOutput<typeof key>;
export type AccountRpcKeyCount = v.InferOutput<typeof keyCount>;

export type AccountRpcKeysRes = v.InferOutput<typeof keysResponse>;
export type AccountRpcKeyCountRes = v.InferOutput<typeof keyCountResponse>;

export default {
  count: keyCountResponse,
  keys: keysResponse,
};
