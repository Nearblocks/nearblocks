import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../../common.js';

const txns = v.object({
  after_ts: tsSchema,
  before_ts: tsSchema,
  cursor: cursorSchema,
  limit: limitSchema,
});

const count = v.object({
  after_ts: tsSchema,
  before_ts: tsSchema,
});

const contractTxns = v.object({
  affected: v.optional(v.string()),
  after_ts: tsSchema,
  before_ts: tsSchema,
  contract: v.string(),
  cursor: cursorSchema,
  limit: limitSchema,
});

const contractTxnCount = v.object({
  affected: v.optional(v.string()),
  after_ts: tsSchema,
  before_ts: tsSchema,
  contract: v.string(),
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
});

export type NFTTxnsReq = v.InferOutput<typeof txns>;
export type NFTTxnsCursor = v.InferOutput<typeof cursor>;
export type NFTTxnCountReq = v.InferOutput<typeof count>;
export type NFTContractTxnsReq = v.InferOutput<typeof contractTxns>;
export type NFTContractTxnCountReq = v.InferOutput<typeof contractTxnCount>;

export default { contractTxnCount, contractTxns, count, cursor, txns };
