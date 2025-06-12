import * as v from 'valibot';

import { responseSchema } from '#schemas/index';

export const blockChunkAgg = v.object({
  count: v.number(),
  gas_limit: v.string(),
  gas_used: v.string(),
});

export const blockTransactionAgg = v.object({
  count: v.number(),
});

export const blockReceiptAgg = v.object({
  count: v.number(),
});

export const block = v.object({
  author_account_id: v.string(),
  block_hash: v.string(),
  block_height: v.number(),
  block_timestamp: v.string(),
  chunks_agg: blockChunkAgg,
  gas_price: v.string(),
  receipts_agg: blockReceiptAgg,
  transactions_agg: blockTransactionAgg,
});

export const blockResponse = responseSchema(block);
export const blockListResponse = responseSchema(v.array(block));
