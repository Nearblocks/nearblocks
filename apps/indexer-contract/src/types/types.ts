import { types } from 'nb-lake';
import {
  ContractEventType,
  Network,
  StateChangeCauseView,
  StateChangeValueView,
} from 'nb-types';

export type Config = {
  cacheExpiry: number;
  dataSource: string;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  delta: number;
  genesisHeight: number;
  insertLimit: number;
  network: Network;
  preloadSize: number;
  s3BucketName: string;
  s3Endpoint: null | types.EndpointConfig;
  s3RegionName: string;
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
