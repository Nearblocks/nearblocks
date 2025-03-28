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
  dbUrlRead: string;
  network: Network;
  s3AccessKey: string;
  s3Bucket: string;
  s3Endpoint: string;
  s3Region: string;
  s3SecretKey: string;
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

export type DataUpdate = {
  accountId: string;
  keyBase64: string;
  valueBase64: string;
};

export type DataDeletion = {
  accountId: string;
  keyBase64: string;
};

export type ContractCode = {
  accountId: string;
  codeBase64: null | string;
  codeHash: null | string;
  type: ContractEventType;
};

export type ContractData = {
  accountId: string;
  keyBase64: string;
  type: ContractEventType;
  valueBase64: null | string;
};
