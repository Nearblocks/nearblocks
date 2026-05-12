import * as v from 'valibot';

import { ActionKind } from 'nb-types';

import { cursorSchema, limitSchema, tsSchema } from '../../common.js';

const receipts = v.object({
  account: v.string(),
  action: v.optional(v.enum(ActionKind)),
  before_ts: tsSchema,
  limit: limitSchema,
  method: v.optional(v.string()),
  next: cursorSchema,
  predecessor: v.optional(v.string()),
  prev: cursorSchema,
  receiver: v.optional(v.string()),
});

const count = v.object({
  account: v.string(),
  action: v.optional(v.enum(ActionKind)),
  before_ts: tsSchema,
  method: v.optional(v.string()),
  predecessor: v.optional(v.string()),
  receiver: v.optional(v.string()),
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

export type AccountReceiptsReq = v.InferOutput<typeof receipts>;
export type AccountReceiptCountReq = v.InferOutput<typeof count>;
export type AccountReceiptsCursor = v.InferOutput<typeof cursor>;
export type AccountReceiptExportReq = v.InferOutput<typeof exportSchema>;

export default { count, cursor, export: exportSchema, receipts };
