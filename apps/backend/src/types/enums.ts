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

export enum FtEventKind {
  BURN = 'BURN',
  MINT = 'MINT',
  TRANSFER = 'TRANSFER',
}

export enum NftEventKind {
  BURN = 'BURN',
  MINT = 'MINT',
  TRANSFER = 'TRANSFER',
}

export enum ReceiptKind {
  ACTION = 'ACTION',
  DATA = 'DATA',
}
