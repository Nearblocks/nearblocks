export enum Network {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}
export enum AccessKeyPermissionKind {
  FULL_ACCESS = 'FULL_ACCESS',
  FUNCTION_CALL = 'FUNCTION_CALL',
}

export enum ActionKind {
  ADD_KEY = 'ADD_KEY',
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  DELETE_KEY = 'DELETE_KEY',
  DEPLOY_CONTRACT = 'DEPLOY_CONTRACT',
  FUNCTION_CALL = 'FUNCTION_CALL',
  STAKE = 'STAKE',
  TRANSFER = 'TRANSFER',
  UNKNOWN = 'UNKNOWN',
}

export enum ExecutionOutcomeStatus {
  FAILURE = 'FAILURE',
  SUCCESS_RECEIPT_ID = 'SUCCESS_RECEIPT_ID',
  SUCCESS_VALUE = 'SUCCESS_VALUE',
  UNKNOWN = 'UNKNOWN',
}

export enum ReceiptKind {
  ACTION = 'ACTION',
  DATA = 'DATA',
}

export enum StateChangeCauseView {
  ActionReceiptGasReward = 'action_receipt_gas_reward',
  ActionReceiptProcessingStarted = 'action_receipt_processing_started',
  InitialState = 'initial_state',
  Migration = 'migration',
  NotWritableToDisk = 'not_writable_to_disk',
  PostponedReceipt = 'postponed_receipt',
  ReceiptProcessing = 'receipt_processing',
  Resharding = 'resharding',
  TransactionProcessing = 'transaction_processing',
  UpdatedDelayedReceipts = 'updated_delayed_receipts',
  ValidatorAccountsUpdate = 'validator_accounts_update',
}

export enum StateChangeValueView {
  AccessKeyDeletion = 'access_key_deletion',
  AccessKeyUpdate = 'access_key_update',
  AccountDeletion = 'account_deletion',
  AccountUpdate = 'account_update',
  ContractCodeDeletion = 'contract_code_deletion',
  ContractCodeUpdate = 'contract_code_update',
  DataDeletion = 'data_deletion',
  DataUpdate = 'data_update',
}

export enum StateChangeStatus {
  FAILURE = 'FAILURE',
  SUCCESS_RECEIPT_ID = 'SUCCESS',
  SUCCESS_VALUE = 'SUCCESS',
  UNKNOWN = 'UNKNOWN',
}

export enum StateChangeDirection {
  Inbound = 'INBOUND',
  Outbound = 'OUTBOUND',
}

export enum StateChangeCause {
  ContractReward = 'CONTRACT_REWARD',
  Receipt = 'RECEIPT',
  Transaction = 'TRANSACTION',
  ValidatorsReward = 'VALIDATORS_REWARD',
}
