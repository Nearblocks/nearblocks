import * as v from 'valibot';

import { ActionKind } from 'nb-types';

import { cursorSchema, limitSchema, tsSchema } from '../../common.js';

const receipts = v.object({
  account: v.string(),
  action: v.optional(v.enum(ActionKind)),
  after_ts: tsSchema,
  before_ts: tsSchema,
  cursor: cursorSchema,
  limit: limitSchema,
  method: v.optional(v.string()),
  predecessor: v.optional(v.string()),
  receiver: v.optional(v.string()),
});

const count = v.object({
  account: v.string(),
  action: v.optional(v.enum(ActionKind)),
  after_ts: tsSchema,
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

export type AccountReceiptsReq = v.InferOutput<typeof receipts>;
export type AccountReceiptCountReq = v.InferOutput<typeof count>;
export type AccountReceiptsCursor = v.InferOutput<typeof cursor>;

export default { count, cursor, receipts };
