import * as v from 'valibot';

import { responseSchema } from '../common.js';

const blockChunkAgg = v.object({
  count: v.number(),
  gas_limit: v.string(),
  gas_used: v.string(),
});

const blockTransactionAgg = v.object({
  count: v.number(),
});

const blockReceiptAgg = v.object({
  count: v.number(),
});

const block = v.object({
  author_account_id: v.string(),
  block_hash: v.string(),
  block_height: v.string(),
  block_timestamp: v.string(),
  chunks_agg: blockChunkAgg,
  gas_price: v.string(),
  prev_block_hash: v.string(),
  receipts_agg: blockReceiptAgg,
  transactions_agg: blockTransactionAgg,
});

const blockCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const blockResponse = responseSchema(block);
const blocksResponse = responseSchema(v.array(block));
const blockCountResponse = responseSchema(blockCount);

export type Block = v.InferOutput<typeof block>;
export type BlockCount = v.InferOutput<typeof blockCount>;

export type BlockRes = v.InferOutput<typeof blockResponse>;
export type BlocksRes = v.InferOutput<typeof blocksResponse>;
export type BlockCountRes = v.InferOutput<typeof blockCountResponse>;

export default {
  block: blockResponse,
  blocks: blocksResponse,
  count: blockCountResponse,
};
