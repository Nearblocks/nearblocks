import * as v from 'valibot';

import { cursorSchema, limitSchema } from '../../common.js';

const accountSchema = v.pipe(
  v.string(),
  v.check(
    (account) => account.includes('.'),
    'Top level accounts are not supported',
  ),
);

const subaccounts = v.object({
  account: accountSchema,
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const count = v.object({
  account: accountSchema,
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
    account: accountSchema,
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
    account: accountSchema,
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

export type AccountSubAccountsReq = v.InferOutput<typeof subaccounts>;
export type AccountSubAccountCountReq = v.InferOutput<typeof count>;
export type AccountSubAccountsCursor = v.InferOutput<typeof cursor>;
export type AccountSubAccountExportReq = v.InferOutput<typeof exportSchema>;

export default { count, cursor, export: exportSchema, subaccounts };
