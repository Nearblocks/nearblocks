import { Action } from 'nb-blocks';
import { AccessKeyPermissionKind, ActionKind, Network } from 'nb-types';

export type Config = {
  cacheItems: number;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  // Temp stream from s3
  dbUrlBase: string;
  dbUrlRead: string;
  delta: number;
  insertLimit: number;
  network: Network;
  s3AccessKey: string;
  s3Bucket: string;
  s3Endpoint: string;
  s3Region: string;
  s3SecretKey: string;
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
