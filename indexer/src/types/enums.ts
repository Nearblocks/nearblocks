export enum Network {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}
export enum AccessKeyPermissionKind {
  FULL_ACCESS = 'FULL_ACCESS',
  FUNCTION_CALL = 'FUNCTION_CALL',
}

export enum ActionKind {
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  DEPLOY_CONTRACT = 'DEPLOY_CONTRACT',
  FUNCTION_CALL = 'FUNCTION_CALL',
  TRANSFER = 'TRANSFER',
  STAKE = 'STAKE',
  ADD_KEY = 'ADD_KEY',
  DELETE_KEY = 'DELETE_KEY',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UNKNOWN = 'UNKNOWN',
}

export enum ExecutionOutcomeStatus {
  UNKNOWN = 'UNKNOWN',
  FAILURE = 'FAILURE',
  SUCCESS_VALUE = 'SUCCESS_VALUE',
  SUCCESS_RECEIPT_ID = 'SUCCESS_RECEIPT_ID',
}

export enum FtEventKind {
  MINT = 'MINT',
  TRANSFER = 'TRANSFER',
  BURN = 'BURN',
}

export enum NftEventKind {
  MINT = 'MINT',
  TRANSFER = 'TRANSFER',
  BURN = 'BURN',
}

export enum ReceiptKind {
  ACTION = 'ACTION',
  DATA = 'DATA',
}

export enum FtLogKind {
  MINT = 'ft_mint',
  TRANSFER = 'ft_transfer',
  BURN = 'ft_burn',
}

export enum NftLogKind {
  MINT = 'nft_mint',
  TRANSFER = 'nft_transfer',
  BURN = 'nft_burn',
}
