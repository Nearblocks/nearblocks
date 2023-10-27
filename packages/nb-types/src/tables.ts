import {
  AccessKeyPermissionKind,
  ActionKind,
  ExecutionOutcomeStatus,
  ReceiptKind,
} from './enums.js';
import { JsonObject, JsonValue } from './types.js';

export interface TTables {
  access_keys: AccessKey;
  accounts: Account;
  action_receipt_actions: ActionReceiptAction;
  action_receipt_output_data: ActionReceiptOutputData;
  balance_events: BalanceEvent;
  blocks: Block;
  chunks: Chunk;
  execution_outcome_receipts: ExecutionOutcomeReceipt;
  execution_outcomes: ExecutionOutcome;
  receipts: Receipt;
  settings: Setting;
  transactions: Transaction;
}

export type AccessKey = {
  account_id: string;
  created_by_block_height: number;
  created_by_block_timestamp: string;
  created_by_receipt_id: null | string;
  deleted_by_block_height: null | number;
  deleted_by_receipt_id: null | string;
  permission_kind: AccessKeyPermissionKind;
  public_key: string;
};

export type Account = {
  account_id: string;
  created_by_block_height: number;
  created_by_block_timestamp: string;
  created_by_receipt_id: null | string;
  deleted_by_block_height: null | number;
  deleted_by_receipt_id: null | string;
};

export type ActionReceiptAction = {
  action_kind: ActionKind;
  args: JsonValue;
  index_in_action_receipt: number;
  receipt_id: string;
  receipt_included_in_block_timestamp: string;
  receipt_predecessor_account_id: string;
  receipt_receiver_account_id: string;
};

export type ActionReceiptOutputData = {
  output_data_id: string;
  output_from_receipt_id: string;
  receipt_included_in_block_timestamp: string;
  receiver_account_id: string;
};

export type BalanceEvent = {
  absolute_nonstaked_amount: string;
  absolute_staked_amount: string;
  affected_account_id: string;
  block_height: number;
  block_timestamp: string;
  cause: string;
  delta_nonstaked_amount: string;
  delta_staked_amount: string;
  direction: string;
  event_index: string;
  involved_account_id: null | string;
  receipt_id: null | string;
  status: string;
  transaction_hash: null | string;
};

export type Block = {
  author_account_id: string;
  block_hash: string;
  block_height: number;
  block_timestamp: string;
  gas_price: string;
  prev_block_hash: string;
  total_supply: string;
};

export type Chunk = {
  author_account_id: string;
  chunk_hash: string;
  gas_limit: number;
  gas_used: number;
  included_in_block_hash: string;
  included_in_block_timestamp: string;
  shard_id: number;
};

export type ExecutionOutcomeReceipt = {
  executed_in_block_timestamp: string;
  executed_receipt_id: string;
  index_in_execution_outcome: number;
  produced_receipt_id: string;
};

export type ExecutionOutcome = {
  executed_in_block_hash: string;
  executed_in_block_timestamp: string;
  executor_account_id: string;
  gas_burnt: number;
  index_in_chunk: number;
  receipt_id: string;
  shard_id: number;
  status: ExecutionOutcomeStatus;
  tokens_burnt: string;
};

export type Receipt = {
  included_in_block_hash: string;
  included_in_block_timestamp: string;
  included_in_chunk_hash: string;
  index_in_chunk: number;
  originated_from_transaction_hash: string;
  predecessor_account_id: string;
  receipt_id: string;
  receipt_kind: ReceiptKind;
  receiver_account_id: string;
};

export type Setting = {
  key: string;
  value: JsonObject;
};

export type Transaction = {
  block_timestamp: string;
  converted_into_receipt_id: string;
  included_in_block_hash: string;
  included_in_chunk_hash: string;
  index_in_chunk: number;
  receipt_conversion_gas_burnt: number;
  receipt_conversion_tokens_burnt: string;
  receiver_account_id: string;
  signer_account_id: string;
  status: ExecutionOutcomeStatus;
  transaction_hash: string;
};
