import * as v from 'valibot';

import { responseSchema } from '../common.js';

const accountCreated = v.object({
  block_timestamp: v.optional(v.string()),
  transaction_hash: v.optional(v.string()),
});

const accountDeleted = v.object({
  block_timestamp: v.optional(v.string()),
  transaction_hash: v.optional(v.string()),
});

const account = v.object({
  account_id: v.string(),
  amount: v.string(),
  amount_staked: v.string(),
  created: accountCreated,
  deleted: accountDeleted,
  storage_usage: v.string(),
});

const accountResponse = responseSchema(account);

export type Account = v.InferOutput<typeof account>;

export type AccountRes = v.InferOutput<typeof accountResponse>;

export default {
  account: accountResponse,
};
