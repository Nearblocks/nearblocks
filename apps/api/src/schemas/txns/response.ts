import * as v from 'valibot';

import { ActionKind, ExecutionOutcomeStatus } from 'nb-types';

import type { JsonData } from '#schemas/index';
import { jsonSchema, responseSchema } from '#schemas/index';

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const action = v.object({
  action: v.enum(ActionKind),
  method: v.nullable(v.string()),
});

const actionsAggList = v.object({
  deposit: v.string(),
});

const outcomesList = v.object({
  status: v.optional(v.boolean()),
});

const outcomesAggList = v.object({
  transaction_fee: v.string(),
});

const txnList = v.object({
  actions: v.array(action),
  actions_agg: actionsAggList,
  block,
  block_timestamp: v.string(),
  index_in_chunk: v.number(),
  outcomes: outcomesList,
  outcomes_agg: outcomesAggList,
  receiver_account_id: v.string(),
  shard_id: v.number(),
  signer_account_id: v.string(),
  transaction_hash: v.string(),
});

const actionsAgg = v.object({
  deposit: v.string(),
  gas_attached: v.string(),
});

const outcomes = v.object({
  status: v.optional(v.boolean()),
  status_key: v.optional(v.enum(ExecutionOutcomeStatus)),
});

const outcomesAgg = v.object({
  gas_used: v.string(),
  transaction_fee: v.string(),
});

const txn = v.object({
  actions: v.array(action),
  actions_agg: actionsAgg,
  block,
  outcomes: outcomes,
  outcomes_agg: outcomesAgg,
  receipt_conversion_gas_burnt: v.string(),
  receipt_conversion_tokens_burnt: v.string(),
  receiver_account_id: v.string(),
  shard_id: v.number(),
  signer_account_id: v.string(),
  transaction_hash: v.string(),
});

export const txnCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const actionsReceipts = v.object({
  action: v.enum(ActionKind),
  args: jsonSchema,
  rlp_hash: v.nullable(v.string()),
});

const outcomeReceipts = v.object({
  executor_account_id: v.optional(v.string()),
  gas_burnt: v.optional(v.string()),
  logs: v.optional(v.nullable(jsonSchema)),
  result: v.optional(v.nullable(jsonSchema)),
  status: v.optional(v.boolean()),
  status_key: v.optional(v.enum(ExecutionOutcomeStatus)),
  tokens_burnt: v.optional(v.string()),
});

type ActionReceipt = {
  action: ActionKind;
  args: JsonData;
  rlp_hash: null | string;
};

type BlockReceipt = {
  block_hash?: string;
  block_height?: string;
  block_timestamp?: string;
};

type OutcomeReceipts = {
  executor_account_id?: string;
  gas_burnt?: string;
  logs?: JsonData | null;
  result?: JsonData | null;
  status?: boolean;
  status_key?: ExecutionOutcomeStatus;
  tokens_burnt?: string;
};

type TxnReceipts = {
  actions: ActionReceipt[];
  block: BlockReceipt;
  outcome: OutcomeReceipts;
  predecessor_account_id: string;
  public_key: string;
  receipt_id: string;
  receipts: TxnReceipts[];
  receiver_account_id: string;
};

// recursive schemas require explicit types
const txnReceipts: v.GenericSchema<TxnReceipts> = v.object({
  actions: v.array(actionsReceipts),
  block,
  outcome: outcomeReceipts,
  predecessor_account_id: v.string(),
  public_key: v.string(),
  receipt_id: v.string(),
  receipts: v.array(v.lazy(() => txnReceipts)),
  receiver_account_id: v.string(),
});

const txnResponse = responseSchema(txn);
const txnsResponse = responseSchema(
  v.array(v.omit(txnList, ['block_timestamp', 'shard_id', 'index_in_chunk'])),
);
const txnsCountResponse = responseSchema(v.omit(txnCount, ['cost']));
const txnReceiptsResponse = responseSchema(txnReceipts);

export type Txn = v.InferOutput<typeof txn>;
export type Txns = v.InferOutput<typeof txnList>;
export type TxnCount = v.InferOutput<typeof txnCount>;
// export type TxnReceipts = v.InferOutput<typeof txnReceipts>;

export type TxnRes = v.InferOutput<typeof txnResponse>;
export type TxnsRes = v.InferOutput<typeof txnsResponse>;
export type TxnsCountRes = v.InferOutput<typeof txnsCountResponse>;
export type TxnReceiptsRes = v.InferOutput<typeof txnReceiptsResponse>;

export default {
  count: txnsCountResponse,
  receipts: txnReceiptsResponse,
  txn: txnResponse,
  txns: txnsResponse,
};
