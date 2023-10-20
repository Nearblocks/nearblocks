import { Network, StateChangeCauseView, StateChangeValueView } from '#ts/enums';

export type BalanceEvent = {
  event_index: string;
  block_height: number;
  receipt_id: string | null;
  transaction_hash: string | null;
  affected_account_id: string;
  involved_account_id: string | null;
  direction: string;
  cause: string;
  status: string;
  delta_staked_amount: string;
  delta_nonstaked_amount: string;
  absolute_staked_amount: string;
  absolute_nonstaked_amount: string;
  block_timestamp: string;
};

export type Setting = {
  key: string;
  value: JsonObject;
};

export type JsonObject = { [Key in string]?: JsonValue };

export interface JsonArray {
  [index: number]: JsonValue;
}

export type JsonValue =
  | string
  | number
  | boolean
  | JsonObject
  | JsonArray
  | null;

export type Config = {
  dbUrl: string;
  redisUrl: string;
  rpcUrl: string;
  network: Network;
  genesisHeight: number;
  cacheExpiry: number;
  insertLimit: number;
  delta: number;
  preloadSize: number;
  s3BucketName: string;
  s3RegionName: string;
  sentryDsn?: string;
};

export type StateChange<TChange> = {
  cause: any;
  change: TChange;
  type: StateChangeValueView;
};

export type AccountUpdate = {
  accountId: string;
  amount: string;
  codeHash: string;
  locked: string;
  storagePaidAt: string;
  storageUsage: string;
};

export type AccountDelete = {
  accountId: string;
};

export type AccountBalance = {
  accountId: string;
  balance: Balance;
};

export type Balance = {
  staked: string;
  nonStaked: string;
};

export type TransactionProcessing = {
  txHash: string;
  type: StateChangeCauseView.TransactionProcessing;
};

export type ReceiptProcessing = {
  receiptHash: string;
  type: StateChangeCauseView.ReceiptProcessing;
};

export type ActionReceiptGasReward = {
  receiptHash: string;
  type: StateChangeCauseView.ActionReceiptGasReward;
};
