import {
  ContractEventType,
  Network,
  StateChangeCauseView,
  StateChangeValueView,
} from 'nb-types';

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  genesisHeight: number;
  indexerKey: string;
  neardataConcurrency: 'auto' | number;
  neardataUrl: string;
  network: Network;
  sentryDsn?: string;
  startBlockHeight: number;
};

export type ReceiptProcessing = {
  receiptHash: string;
  type: StateChangeCauseView.ReceiptProcessing;
};

export type StateChange<TChange> = {
  cause: StateChangeCause;
  change: TChange;
  type: StateChangeValueView;
};

export type StateChangeCause = {
  receiptHash: string;
  type: string;
};

export type ContractUpdate = {
  accountId: string;
  codeBase64: string;
};

export type ContractDeletion = {
  accountId: string;
};

export type ContractCode = {
  accountId: string;
  codeBase64: null | string;
  codeHash: null | string;
  globalAccountId: null | string;
  globalCodeHash: null | string;
  type: ContractEventType;
};
