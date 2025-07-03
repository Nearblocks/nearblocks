import { Network, StateChangeCauseView, StateChangeValueView } from 'nb-types';

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlBase: string;
  indexerKey: string;
  insertLimit: number;
  network: Network;
  s3AccessKey: string;
  s3Bucket: string;
  s3Host: string;
  s3Port: number;
  s3SecretKey: string;
  s3UseSsl: boolean;
  sentryDsn?: string;
  startBlockHeight: number;
};

export type StateChange<TChange> = {
  cause: unknown;
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
  nonStaked: string;
  staked: string;
  storage: string;
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
