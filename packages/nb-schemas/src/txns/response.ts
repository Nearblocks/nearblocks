import * as v from 'valibot';

import { ActionKind, EventCause, ExecutionOutcomeStatus } from 'nb-types';

import type { JsonData } from '../common.js';
import { jsonSchema, responseSchema } from '../common.js';

const block = v.object({
  block_hash: v.optional(v.string()),
  block_height: v.optional(v.string()),
  block_timestamp: v.optional(v.string()),
});

const actionListItem = v.object({
  action: v.enum(ActionKind),
  method: v.nullable(v.string()),
});

const action = v.object({
  ...actionListItem.entries,
  args: v.nullable(jsonSchema),
  rlp_hash: v.nullable(v.string()),
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

const txnListItem = v.object({
  actions: v.array(actionListItem),
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

const txn = v.object({
  ...txnListItem.entries,
  actions: v.array(action),
});

const txnCount = v.object({
  cost: v.string(),
  count: v.string(),
});

const actionsReceipts = v.object({
  action: v.enum(ActionKind),
  args: jsonSchema,
  method: v.nullable(v.string()),
  rlp_hash: v.nullable(v.string()),
});

const outcomeReceipts = v.object({
  executor_account_id: v.optional(v.string()),
  gas_burnt: v.optional(v.string()),
  logs: v.optional(v.nullable(v.array(jsonSchema))),
  result: v.optional(v.nullable(jsonSchema)),
  status: v.optional(v.boolean()),
  status_key: v.optional(v.enum(ExecutionOutcomeStatus)),
  tokens_burnt: v.optional(v.string()),
});

export type ActionReceipt = {
  action: ActionKind;
  args: JsonData;
  method: null | string;
  rlp_hash: null | string;
};

export type BlockReceipt = {
  block_hash?: string;
  block_height?: string;
  block_timestamp?: string;
};

export type OutcomeReceipt = {
  executor_account_id?: string;
  gas_burnt?: string;
  logs?: JsonData[] | null;
  result?: JsonData | null;
  status?: boolean;
  status_key?: ExecutionOutcomeStatus;
  tokens_burnt?: string;
};

export type TxnReceipt = {
  actions: ActionReceipt[];
  block: BlockReceipt;
  outcome: OutcomeReceipt;
  predecessor_account_id: string;
  public_key: string;
  receipt_id: string;
  receipts: TxnReceipt[];
  receiver_account_id: string;
};

// recursive schemas require explicit types
const txnReceipt: v.GenericSchema<TxnReceipt> = v.object({
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
  meta: ftMeta,
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
  meta: nftMeta,
  receipt_id: v.string(),
  shard_id: v.number(),
  token_id: v.string(),
  token_meta: nftTokenMeta,
});

const mtMeta = v.object({
  contract: v.string(),
  name: v.nullable(v.string()),
  spec: v.nullable(v.string()),
});

const mtBaseMeta = v.object({
  base_uri: v.nullable(v.string()),
  contract: v.string(),
  decimals: v.nullable(v.number()),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
  token: v.string(),
});

const mtTokenMeta = v.object({
  contract: v.string(),
  media: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  title: v.nullable(v.string()),
  token: v.string(),
});

const txnMT = v.object({
  affected_account_id: v.string(),
  base_meta: v.optional(mtBaseMeta),
  block_timestamp: v.string(),
  cause: v.enum(EventCause),
  contract_account_id: v.string(),
  delta_amount: v.string(),
  event_index: v.number(),
  involved_account_id: v.nullable(v.string()),
  meta: mtMeta,
  receipt_id: v.string(),
  shard_id: v.number(),
  token_id: v.string(),
  token_meta: mtTokenMeta,
});

const txnResponse = responseSchema(txn);
const txnsResponse = responseSchema(v.array(txnListItem));
const txnCountResponse = responseSchema(txnCount);
const txnReceiptsResponse = responseSchema(txnReceipt);
const txnFTsResponse = responseSchema(v.array(txnFT));
const txnNFTsResponse = responseSchema(v.array(txnNFT));
const txnMTsResponse = responseSchema(v.array(txnMT));

export type Txn = v.InferOutput<typeof txn>;
export type TxnListItem = v.InferOutput<typeof txnListItem>;
export type TxnCount = v.InferOutput<typeof txnCount>;
// export type TxnReceipt = v.InferOutput<typeof txnReceipt>;
export type TxnFT = v.InferOutput<typeof txnFT>;
export type TxnNFT = v.InferOutput<typeof txnNFT>;
export type TxnMT = v.InferOutput<typeof txnMT>;

export type TxnRes = v.InferOutput<typeof txnResponse>;
export type TxnsRes = v.InferOutput<typeof txnsResponse>;
export type TxnCountRes = v.InferOutput<typeof txnCountResponse>;
export type TxnReceiptsRes = v.InferOutput<typeof txnReceiptsResponse>;
export type TxnFTsRes = v.InferOutput<typeof txnFTsResponse>;
export type TxnNFTsRes = v.InferOutput<typeof txnNFTsResponse>;
export type TxnMTsRes = v.InferOutput<typeof txnMTsResponse>;

export default {
  count: txnCountResponse,
  fts: txnFTsResponse,
  mts: txnMTsResponse,
  nfts: txnNFTsResponse,
  receipts: txnReceiptsResponse,
  txn: txnResponse,
  txns: txnsResponse,
};
