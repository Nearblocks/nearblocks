import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../common.js';

const txns = v.object({
  before_ts: tsSchema,
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const count = v.object({
  before_ts: tsSchema,
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
});

const contractTxns = v.object({
  affected: v.optional(v.string()),
  before_ts: tsSchema,
  contract: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
  token: v.optional(v.string()),
});

const contractTxnCount = v.object({
  affected: v.optional(v.string()),
  before_ts: tsSchema,
  contract: v.string(),
  token: v.optional(v.string()),
});

const contractHolders = v.object({
  contract: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
  token: v.optional(v.string()),
});

const contractHolderCount = v.object({
  contract: v.string(),
  token: v.optional(v.string()),
});

const contractHoldersCursor = v.object({
  account: v.string(),
  amount: v.string(),
});

export type MTTxnsReq = v.InferOutput<typeof txns>;
export type MTTxnCountReq = v.InferOutput<typeof count>;
export type MTTxnsCursor = v.InferOutput<typeof cursor>;
export type MTContractTxnsReq = v.InferOutput<typeof contractTxns>;
export type MTContractTxnCountReq = v.InferOutput<typeof contractTxnCount>;
export type MTContractHoldersReq = v.InferOutput<typeof contractHolders>;
export type MTContractHolderCountReq = v.InferOutput<
  typeof contractHolderCount
>;
export type MTContractHoldersCursor = v.InferOutput<
  typeof contractHoldersCursor
>;

export default {
  contractHolderCount,
  contractHolders,
  contractHoldersCursor,
  contractTxnCount,
  contractTxns,
  count,
  cursor,
  txns,
};
