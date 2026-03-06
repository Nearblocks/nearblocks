import { Action } from 'nb-neardata';
import { AccessKeyPermissionKind, ActionKind, Network } from 'nb-types';

export type Config = {
  cacheItems: number;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlRead: string;
  genesisHeight: number;
  indexerKey: string;
  insertLimit: number;
  neardataUrl: string;
  network: Network;
  sentryDsn?: string;
  startBlockHeight: number;
};

export type ActionReceipt = {
  Action: {
    actions: Action[];
    gasPrice: string;
    inputDataIds: string[];
    outputDataReceivers: DataReceiver[];
    signerId: string;
    signerPublicKey: string;
  };
};

export type DataReceiver = {
  dataId: string;
  receiverId: string;
};

export type DataReceipt = {
  Data: {
    data: string;
    dataId: string;
  };
};

export type ReceiptAction = {
  args: string;
  kind: ActionKind;
  rlpHash: null | string;
};

export type AccessKeyPermission = {
  permission_details?: {
    allowance: string;
    method_names: string[];
    receiver_id: string;
  };
  permission_kind: AccessKeyPermissionKind;
};

export type RlpJson = {
  tx_bytes_b64: string;
};
