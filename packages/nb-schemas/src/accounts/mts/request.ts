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
  token: v.optional(v.string()),
});

const count = v.object({
  account: v.string(),
  before_ts: tsSchema,
  cause: v.optional(v.string()),
  contract: v.optional(v.string()),
  involved: v.optional(v.string()),
  token: v.optional(v.string()),
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

const dateExportSchema = v.pipe(
  v.object({
    account: v.string(),
    end: dateSchema,
    filter: v.literal('date'),
    start: dateSchema,
  }),
  v.check(
    (val) => val.end >= val.start,
    'End date must be after or equal to start date',
  ),
);

const blockExportSchema = v.pipe(
  v.object({
    account: v.string(),
    block_end: v.pipe(v.string(), v.regex(/^\d+$/), v.transform(Number)),
    block_start: v.pipe(v.string(), v.regex(/^\d+$/), v.transform(Number)),
    filter: v.literal('block'),
  }),
  v.check(
    (val) => val.block_end >= val.block_start,
    'End block must be after or equal to start block',
  ),
);

const exportSchema = v.union([dateExportSchema, blockExportSchema]);

export type AccountMTTxnsReq = v.InferOutput<typeof txns>;
export type AccountMTTxnCountReq = v.InferOutput<typeof count>;
export type AccountMTTxnsCursor = v.InferOutput<typeof cursor>;
export type AccountMTTxnExportReq = v.InferOutput<typeof exportSchema>;

export default { count, cursor, export: exportSchema, txns };
