import * as v from 'valibot';

import { responseSchema } from '../../common.js';

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

const subaccount = v.object({
  account_id: v.string(),
  action_timestamp: v.string(),
  created,
  deleted,
});

const subAccountCount = v.object({
  count: v.string(),
});

const subaccountsResponse = responseSchema(v.array(subaccount));
const subAccountCountResponse = responseSchema(subAccountCount);

export type AccountSubAccount = v.InferOutput<typeof subaccount>;
export type AccountSubAccountCount = v.InferOutput<typeof subAccountCount>;

export type AccountSubAccountsRes = v.InferOutput<typeof subaccountsResponse>;
export type AccountSubAccountCountRes = v.InferOutput<
  typeof subAccountCountResponse
>;

export default {
  count: subAccountCountResponse,
  subaccounts: subaccountsResponse,
};
