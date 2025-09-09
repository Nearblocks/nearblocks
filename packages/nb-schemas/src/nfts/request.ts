import * as v from 'valibot';

import { cursorSchema, limitSchema } from '../common.js';

const txns = v.object({
  cursor: cursorSchema,
  limit: limitSchema,
});

const contractTxns = v.object({
  affected: v.optional(v.string()),
  contract: v.string(),
  cursor: cursorSchema,
  involved: v.optional(v.string()),
  limit: limitSchema,
});

const contractTxnCount = v.object({
  affected: v.optional(v.string()),
  contract: v.string(),
  involved: v.optional(v.string()),
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
  type: v.number(),
});

export type NFTTxnsReq = v.InferOutput<typeof txns>;
export type NFTTxnsCursor = v.InferOutput<typeof cursor>;
export type NFTContractTxnsReq = v.InferOutput<typeof contractTxns>;
export type NFTContractTxnCountReq = v.InferOutput<typeof contractTxnCount>;

export default { contractTxnCount, contractTxns, cursor, txns };
