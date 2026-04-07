import * as v from 'valibot';

import { DestinationChain } from 'nb-types';

import { cursorSchema, limitSchema, tsSchema } from '../common.js';

const txns = v.object({
  account: v.optional(v.string()),
  address: v.optional(v.string()),
  before_ts: tsSchema,
  chain: v.optional(v.enum(DestinationChain)),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
  txn: v.optional(v.string()),
});

const count = v.object({
  account: v.optional(v.string()),
  address: v.optional(v.string()),
  before_ts: tsSchema,
  chain: v.optional(v.enum(DestinationChain)),
  txn: v.optional(v.string()),
});

const cursor = v.object({
  index: v.number(),
  timestamp: v.string(),
});

export type MCTxnsReq = v.InferOutput<typeof txns>;
export type MCTxnCountReq = v.InferOutput<typeof count>;
export type MCTxnsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, txns };
