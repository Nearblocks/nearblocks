export enum Network {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
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
}

export enum EventKind {
  MINT = 'MINT',
  TRANSFER = 'TRANSFER',
  BURN = 'BURN',
}

export enum VerificationKind {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
  UPDATE_EMAIL = 'UPDATE_EMAIL',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  UNPAID = 'unpaid',
}
