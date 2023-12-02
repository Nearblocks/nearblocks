export enum ActionKind {
  ADD_KEY = 'ADD_KEY',
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  DELETE_KEY = 'DELETE_KEY',
  DEPLOY_CONTRACT = 'DEPLOY_CONTRACT',
  FUNCTION_CALL = 'FUNCTION_CALL',
  STAKE = 'STAKE',
  TRANSFER = 'TRANSFER',
}

export enum EventKind {
  BURN = 'BURN',
  MINT = 'MINT',
  TRANSFER = 'TRANSFER',
}

export enum VerificationKind {
  RESET_PASSWORD = 'RESET_PASSWORD',
  UPDATE_EMAIL = 'UPDATE_EMAIL',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
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
