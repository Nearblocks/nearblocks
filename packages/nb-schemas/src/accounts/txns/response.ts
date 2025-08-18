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

const outcomes = v.object({
  status: v.optional(v.boolean()),
});

const outcomesAgg = v.object({
  transaction_fee: v.string(),
});

const txnList = v.object({
  actions: v.array(action),
  actions_agg: actionsAgg,
  block,
  block_timestamp: v.string(),
  index_in_chunk: v.number(),
  outcomes: outcomes,
  outcomes_agg: outcomesAgg,
  receiver_account_id: v.string(),
  shard_id: v.number(),
  signer_account_id: v.string(),
  transaction_hash: v.string(),
});

const txnCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const txnsResponse = responseSchema(
  v.array(v.omit(txnList, ['block_timestamp', 'shard_id', 'index_in_chunk'])),
);
const txnCountResponse = responseSchema(v.omit(txnCount, ['cost']));

export type AccountTxns = v.InferOutput<typeof txnList>;
export type AccountTxnCount = v.InferOutput<typeof txnCount>;

export type AccountTxnsRes = v.InferOutput<typeof txnsResponse>;
export type AccountTxnCountRes = v.InferOutput<typeof txnCountResponse>;

export default {
  count: txnCountResponse,
  txns: txnsResponse,
};
