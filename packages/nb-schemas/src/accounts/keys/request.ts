import * as v from 'valibot';

import { cursorSchema, limitSchema } from '../../common.js';

const keys = v.object({
  account: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const count = v.object({
  account: v.string(),
});

const cursor = v.object({
  key: v.string(),
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

export type AccountKeysReq = v.InferOutput<typeof keys>;
export type AccountKeyCountReq = v.InferOutput<typeof count>;
export type AccountKeysCursor = v.InferOutput<typeof cursor>;
export type AccountKeyExportReq = v.InferOutput<typeof exportSchema>;

export default { count, cursor, export: exportSchema, keys };
