/* eslint-disable perfectionist/sort-enums */
import type {
  AccessKeyList,
  AccountView,
  BlockHeader,
  BlockResult,
  EpochValidatorInfo,
  ExecutionOutcomeWithIdView,
  FinalExecutionOutcome,
  Provider,
  Transaction,
} from 'near-api-js/lib/providers/provider.js';
import type { types } from 'near-lake-framework';

export {
  AccountView,
  BlockHeader,
  BlockResult,
  EpochValidatorInfo,
  FinalExecutionOutcome,
  Provider,
  Transaction,
  types,
};

export enum TxExecutionStatus {
  NONE = 'NONE',
  INCLUDED = 'INCLUDED',
  EXECUTEDOPTIMISTIC = 'EXECUTED_OPTIMISTIC',
  INCLUDEDFINAL = 'INCLUDED_FINAL',
  EXECUTED = 'EXECUTED',
  FINAL = 'FINAL',
}

export interface RpcRequest {
  id: string;
  jsonrpc: string;
  method: string;
  params: RpcRequestParams;
}

type RpcRequestParams = {
  [key: string]: string;
};

export interface RpcResponse<T> {
  error?: RpcResponseError;
  id: string;
  jsonrpc: string;
  result?: T;
}

type RpcResponseError = {
  cause: RpcResponseErrorCause;
  name: string;
};

type RpcResponseErrorCause = {
  info: unknown;
  name: string;
};

export interface RpcResultAccount extends AccountView {}
export interface RpcResultBlock extends BlockResult {}
export interface RpcResultTxn extends FinalExecutionOutcome {
  receipts_outcome: ExecutionOutcomeWithIdView[];
  transaction: Transaction;
  transaction_outcome: ExecutionOutcomeWithIdView;
}

export interface ExecutionOutcomeReceiptDetail {
  predecessor_id: string;
  receipt: {
    Action: ExecutionOutcomeReceiptAction;
  };
  receipt_id: string;
  receiver_id: string;
}
export type ReceiptAction = {
  Transfer: {
    deposit: string;
  };
};

export interface ExecutionOutcomeReceiptAction {
  actions: ReceiptAction[];
  gas_price: string;
  input_data_ids: string[];
  output_data_receivers: string[];
  signer_id: string;
  signer_public_key: string;
}

export interface RpcResultTxnReceipt extends RpcResultTxn {
  receipts: ExecutionOutcomeReceiptDetail[];
}
export interface RpcResultAccessKey extends AccessKeyList {}
export interface RpcResultReceipt {
  parent_transaction_hash: string;
  receipt_id: string;
  shard_id: number;
}
