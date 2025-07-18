/* eslint-disable perfectionist/sort-enums */
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
  DELEGATE_ACTION = 'DELEGATE_ACTION',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  DELETE_KEY = 'DELETE_KEY',
  DEPLOY_CONTRACT = 'DEPLOY_CONTRACT',
  DEPLOY_GLOBAL_CONTRACT = 'DEPLOY_GLOBAL_CONTRACT',
  DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID = 'DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID',
  FUNCTION_CALL = 'FUNCTION_CALL',
  STAKE = 'STAKE',
  TRANSFER = 'TRANSFER',
  UNKNOWN = 'UNKNOWN',
  USE_GLOBAL_CONTRACT = 'USE_GLOBAL_CONTRACT',
  USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID = 'USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID',
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

export enum EventCause {
  BURN = 'BURN',
  MINT = 'MINT',
  TRANSFER = 'TRANSFER',
}

export enum DexEventType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum NEP {
  Nep141 = 'nep141',
  Nep171 = 'nep171',
  Nep245 = 'nep245',
}

export enum EventStandard {
  FT = 'FT',
  FT_LEGACY = 'FT_LEGACY',
  NFT = 'NFT',
  MT = 'MT',
}

export enum FTLogKind {
  BURN = 'ft_burn',
  MINT = 'ft_mint',
  TRANSFER = 'ft_transfer',
}

export enum NFTLogKind {
  BURN = 'nft_burn',
  MINT = 'nft_mint',
  TRANSFER = 'nft_transfer',
}

export enum MTLogKind {
  BURN = 'mt_burn',
  MINT = 'mt_mint',
  TRANSFER = 'mt_transfer',
}

export enum StakingEventType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  STAKE = 'STAKE',
  REWARD = 'REWARD',
  CONTRACT = 'CONTRACT',
  UNSTAKE = 'UNSTAKE',
}

// Used for creating DB event index
export enum EventType {
  NEP141 = 1,
  WRAP_NEAR = 2,
  TKN_NEAR = 3,
  FACTORY_BRIDGE_NEAR = 4,
  AURORA = 5,
  TOKEN_A11BD_NEAR = 6,
  TOKEN_SKYWARD_NEAR = 7,
  META_POOL_NEAR = 8,
  META_TOKEN_NEAR = 9,
  TOKEN_BURROW_NEAR = 10,
  TOKEN_REF_FINANCE_NEAR = 11,
  TOKEN_V2_REF_FINANCE_NEAR = 12,
  L2E_NEAR = 13,
  FUSOTAO_TOKEN = 14,
}
