import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../../common.js';

const txns = v.object({
  account: v.string(),
  before_ts: tsSchema,
  cause: v.optional(v.string()),
  contract: v.optional(v.string()),
  involved: v.optional(v.string()),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const count = v.object({
  account: v.string(),
  before_ts: tsSchema,
  cause: v.optional(v.string()),
  contract: v.optional(v.string()),
  involved: v.optional(v.string()),
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
  type: v.number(),
});

const dateSchema = v.pipe(
  v.string(),
  v.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  v.check((val) => !isNaN(new Date(val).getTime()), 'Invalid date'),
);

const exportSchema = v.pipe(
  v.object({
    account: v.string(),
    end: dateSchema,
    start: dateSchema,
  }),
  v.check(
    (val) => val.end >= val.start,
    'End date must be after or equal to start date',
  ),
);

export type AccountFTTxnsReq = v.InferOutput<typeof txns>;
export type AccountFTTxnCountReq = v.InferOutput<typeof count>;
export type AccountFTTxnsCursor = v.InferOutput<typeof cursor>;
export type AccountFTTxnExportReq = v.InferOutput<typeof exportSchema>;

export default { count, cursor, export: exportSchema, txns };
