import * as v from 'valibot';

import { ActionKind, EventCause, ExecutionOutcomeStatus } from 'nb-types';

import type { JsonData } from '../common.js';
import { jsonSchema, responseSchema } from '../common.js';

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const action = v.object({
  action: v.enum(ActionKind),
  method: v.nullable(v.string()),
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
  block_timestamp: v.string(),
  index_in_chunk: v.number(),
  outcomes: outcomes,
  outcomes_agg: outcomesAgg,
  receipt_conversion_gas_burnt: v.string(),
  receipt_conversion_tokens_burnt: v.string(),
  receiver_account_id: v.string(),
  shard_id: v.number(),
  signer_account_id: v.string(),
  transaction_hash: v.string(),
});

const txnCount = v.object({
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

export type TxnReceipts = {
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
const txnReceipt: v.GenericSchema<TxnReceipts> = v.object({
  actions: v.array(actionsReceipts),
  block,
  outcome: outcomeReceipts,
  predecessor_account_id: v.string(),
  public_key: v.string(),
  receipt_id: v.string(),
  receipts: v.array(v.lazy(() => txnReceipt)),
  receiver_account_id: v.string(),
});

const ftMeta = v.object({
  contract: v.string(),
  decimals: v.nullable(v.number()),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
});

const txnFT = v.object({
  affected_account_id: v.string(),
  block_timestamp: v.string(),
  cause: v.enum(EventCause),
  contract_account_id: v.string(),
  delta_amount: v.string(),
  event_index: v.number(),
  event_type: v.number(),
  involved_account_id: v.nullable(v.string()),
  meta: v.optional(ftMeta),
  receipt_id: v.string(),
  shard_id: v.number(),
});

const nftMeta = v.object({
  base_uri: v.nullable(v.string()),
  contract: v.string(),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
});

const nftTokenMeta = v.object({
  contract: v.string(),
  media: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  title: v.nullable(v.string()),
  token: v.string(),
});

const txnNFT = v.object({
  affected_account_id: v.string(),
  block_timestamp: v.string(),
  cause: v.enum(EventCause),
  contract_account_id: v.string(),
  delta_amount: v.number(),
  event_index: v.number(),
  involved_account_id: v.nullable(v.string()),
  meta: v.optional(nftMeta),
  receipt_id: v.string(),
  shard_id: v.number(),
  token_id: v.string(),
  token_meta: v.optional(nftTokenMeta),
});

const txnResponse = responseSchema(
  v.omit(txn, ['block_timestamp', 'index_in_chunk']),
);
const txnsResponse = responseSchema(
  v.array(v.omit(txn, ['block_timestamp', 'shard_id', 'index_in_chunk'])),
);
const txnCountResponse = responseSchema(v.omit(txnCount, ['cost']));
const txnReceiptsResponse = responseSchema(txnReceipt);
const txnFTsResponse = responseSchema(
  v.array(
    v.omit(txnFT, ['block_timestamp', 'shard_id', 'event_index', 'event_type']),
  ),
);
const txnNFTsResponse = responseSchema(
  v.array(v.omit(txnNFT, ['block_timestamp', 'shard_id', 'event_index'])),
);

export type Txn = v.InferOutput<typeof txn>;
export type TxnCount = v.InferOutput<typeof txnCount>;
// export type TxnReceipt = v.InferOutput<typeof txnReceipt>;
export type TxnFT = v.InferOutput<typeof txnFT>;
export type TxnNFT = v.InferOutput<typeof txnNFT>;

export type TxnRes = v.InferOutput<typeof txnResponse>;
export type TxnsRes = v.InferOutput<typeof txnsResponse>;
export type TxnCountRes = v.InferOutput<typeof txnCountResponse>;
export type TxnReceiptsRes = v.InferOutput<typeof txnReceiptsResponse>;
export type TxnFTsRes = v.InferOutput<typeof txnFTsResponse>;
export type TxnNFTsRes = v.InferOutput<typeof txnNFTsResponse>;

export default {
  count: txnCountResponse,
  fts: txnFTsResponse,
  nfts: txnNFTsResponse,
  receipts: txnReceiptsResponse,
  txn: txnResponse,
  txns: txnsResponse,
};
