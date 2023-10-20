export enum Network {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}

export enum StateChangeCauseView {
  NotWritableToDisk = 'not_writable_to_disk',
  InitialState = 'initial_state',
  TransactionProcessing = 'transaction_processing',
  ActionReceiptProcessingStarted = 'action_receipt_processing_started',
  ActionReceiptGasReward = 'action_receipt_gas_reward',
  ReceiptProcessing = 'receipt_processing',
  PostponedReceipt = 'postponed_receipt',
  UpdatedDelayedReceipts = 'updated_delayed_receipts',
  ValidatorAccountsUpdate = 'validator_accounts_update',
  Migration = 'migration',
  Resharding = 'resharding',
}

export enum StateChangeValueView {
  AccountUpdate = 'account_update',
  AccountDeletion = 'account_deletion',
  AccessKeyUpdate = 'access_key_update',
  AccessKeyDeletion = 'access_key_deletion',
  DataUpdate = 'data_update',
  DataDeletion = 'data_deletion',
  ContractCodeUpdate = 'contract_code_update',
  ContractCodeDeletion = 'contract_code_deletion',
}

export enum ExecutionOutcomeStatus {
  UNKNOWN = 'UNKNOWN',
  FAILURE = 'FAILURE',
  SUCCESS_VALUE = 'SUCCESS',
  SUCCESS_RECEIPT_ID = 'SUCCESS',
}

export enum Direction {
  Inbound = 'INBOUND',
  Outbound = 'OUTBOUND',
}

export enum Cause {
  ValidatorsReward = 'VALIDATORS_REWARD',
  Transaction = 'TRANSACTION',
  Receipt = 'RECEIPT',
  ContractReward = 'CONTRACT_REWARD',
}
