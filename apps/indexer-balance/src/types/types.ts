import { Network, StateChangeCauseView, StateChangeValueView } from 'nb-types';

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlRead: string;
  genesisHeight: number;
  network: Network;
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
