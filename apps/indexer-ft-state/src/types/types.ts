import {
  FTKeyEncoding,
  FTValueEncoding,
  Network,
  StateChangeValueView,
} from 'nb-types';

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  fastnearApiKey?: string;
  indexerKey: string;
  insertLimit: number;
  neardataConcurrency: 'auto' | number;
  neardataUrl?: string;
  network: Network;
  rawLag: number;
  rawThreshold: number;
  sentryDsn?: string;
  startBlockHeight: number;
};

export type StateChange<TChange> = {
  cause: StateChangeCause;
  change: TChange;
  type: StateChangeValueView;
};

export type StateChangeCause = {
  receiptHash?: string;
  txHash?: string;
  type: string;
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

export type AccountUpdate = {
  accountId: string;
  amount: string;
  codeHash: string;
  locked: string;
  storagePaidAt: string;
  storageUsage: string;
};

export type ContractCodeUpdate = {
  accountId: string;
  codeBase64: string;
};

export type Layout = {
  accountOffset: null | number;
  accountPath: null | string;
  keyEncoding: FTKeyEncoding;
  keyPrefix: Buffer;
  valueEncoding: FTValueEncoding;
  valueOffset: null | number;
  valuePath: null | string;
};

export type Evidence = {
  accounts: Set<string>;
  mints: Map<string, bigint>;
};

export type UntrackedReason = 'event_contradiction';

export type EventLog = {
  data?: unknown;
  event?: string;
  standard?: string;
};

export type FTEventData = {
  amount?: string;
  new_owner_id?: string;
  old_owner_id?: string;
  owner_id?: string;
};

export type StorageWrite = {
  causeReceiptHash?: string;
  key: Buffer;
  value: Buffer | null;
};

export type Resolved = { account: string; amount: bigint };
