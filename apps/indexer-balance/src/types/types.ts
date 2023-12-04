import { types } from 'near-lake-framework';

import { Network, StateChangeCauseView, StateChangeValueView } from 'nb-types';

export type Config = {
  cacheExpiry: number;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  delta: number;
  insertLimit: number;
  network: Network;
  preloadSize: number;
  redisUrl: string;
  rpcUrl: string;
  s3BucketName: string;
  s3Endpoint: null | types.EndpointConfig;
  s3RegionName: string;
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
