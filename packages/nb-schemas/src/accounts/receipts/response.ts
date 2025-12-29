import * as v from 'valibot';

import { ActionKind } from 'nb-types';

import { responseSchema } from '../../common.js';

const action = v.object({
  action: v.enum(ActionKind),
  method: v.nullable(v.string()),
});

const actionsAgg = v.object({
  deposit: v.string(),
});

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const outcome = v.object({
  status: v.optional(v.boolean()),
});

const receipt = v.object({
  actions: v.array(action),
  actions_agg: actionsAgg,
  block,
  included_in_block_timestamp: v.string(),
  index_in_chunk: v.number(),
  outcome,
  predecessor_account_id: v.string(),
  receipt_id: v.string(),
  receiver_account_id: v.string(),
  shard_id: v.number(),
  transaction_hash: v.string(),
});

const receiptCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const receiptsResponse = responseSchema(
  v.array(
    v.omit(receipt, [
      'included_in_block_timestamp',
      'shard_id',
      'index_in_chunk',
    ]),
  ),
);
const receiptCountResponse = responseSchema(v.omit(receiptCount, ['cost']));

export type AccountReceipt = v.InferOutput<typeof receipt>;
export type AccountReceiptCount = v.InferOutput<typeof receiptCount>;

export type AccountReceiptsRes = v.InferOutput<typeof receiptsResponse>;
export type AccountReceiptCountRes = v.InferOutput<typeof receiptCountResponse>;

export default {
  count: receiptCountResponse,
  receipts: receiptsResponse,
};
