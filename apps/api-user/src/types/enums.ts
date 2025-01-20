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
