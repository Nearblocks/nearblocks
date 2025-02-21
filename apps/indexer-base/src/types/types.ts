import { types } from 'near-lake-framework';

import { AccessKeyPermissionKind, ActionKind, Network } from 'nb-types';

export interface Config {
  cacheExpiry: number;
  dataSource: string;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  delta: number;
  disableS3Upload: boolean;
  fastnearEndpoint?: string;
  genesisFile: string;
  genesisHeight: number;
  genesisTimestamp: string;
  insertLimit: number;
  nearlakeAccessKey: string;
  nearlakeBucketName: string;
  nearlakeEndpoint: null | types.EndpointConfig;
  nearlakeRegionName: string;
  nearlakeSecretKey: string;
  network: Network;
  preloadSize: number;
  redisPassword: string;
  redisSentinelName: string;
  redisSentinelUrls: string;
  redisUrl: string;
  s3AccessKey: string;
  s3Bucket: string;
  s3Endpoint: string;
  s3Region: string;
  s3SecretKey: string;
  sentryDsn?: string;
  startBlockHeight: number;
}

export type ActionReceipt = {
  Action: {
    actions: types.Action[];
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
