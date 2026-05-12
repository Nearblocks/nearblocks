import * as v from 'valibot';

import { cursorSchema, limitSchema, tsSchema } from '../../common.js';

const txns = v.object({
  account: v.string(),
  before_ts: tsSchema,
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
  receiver: v.optional(v.string()),
  signer: v.optional(v.string()),
});

const count = v.object({
  account: v.string(),
  before_ts: tsSchema,
  receiver: v.optional(v.string()),
  signer: v.optional(v.string()),
});

const cursor = v.object({
  index: v.number(),
  shard: v.number(),
  timestamp: v.string(),
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

export type AccountTxnsReq = v.InferOutput<typeof txns>;
export type AccountTxnCountReq = v.InferOutput<typeof count>;
export type AccountTxnsCursor = v.InferOutput<typeof cursor>;
export type AccountTxnExportReq = v.InferOutput<typeof exportSchema>;

export default { count, cursor, export: exportSchema, txns };
