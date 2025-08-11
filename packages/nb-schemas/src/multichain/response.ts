import * as v from 'valibot';

import { DestinationChain } from 'nb-types';

import { responseSchema } from '../common.js';

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const txnList = v.object({
  account_id: v.string(),
  block,
  block_timestamp: v.string(),
  dest_address: v.nullable(v.string()),
  dest_chain: v.nullable(v.enum(DestinationChain)),
  dest_txn: v.nullable(v.string()),
  event_index: v.number(),
  public_key: v.string(),
  receipt_id: v.string(),
  transaction_hash: v.string(),
});

const txnCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const txnsResponse = responseSchema(v.array(v.omit(txnList, ['event_index'])));
const txnsCountResponse = responseSchema(v.omit(txnCount, ['cost']));

export type McTxns = v.InferOutput<typeof txnList>;
export type McTxnCount = v.InferOutput<typeof txnCount>;

export type McTxnsRes = v.InferOutput<typeof txnsResponse>;
export type McTxnsCountRes = v.InferOutput<typeof txnsCountResponse>;

export default {
  count: txnsCountResponse,
  txns: txnsResponse,
};
