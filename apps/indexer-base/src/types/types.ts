import { types } from 'near-lake-framework';

import { AccessKeyPermissionKind, ActionKind, Network } from 'nb-types';

export interface Config {
  cacheExpiry: number;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  delta: number;
  genesisFile: string;
  genesisHeight: number;
  genesisTimestamp: string;
  insertLimit: number;
  network: Network;
  preloadSize: number;
  redisUrl: string;
  s3BucketName: string;
  s3RegionName: string;
  sentryDsn?: string;
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
};

export type AccessKeyPermission = {
  permission_details?: {
    allowance: string;
    method_names: string[];
    receiver_id: string;
  };
  permission_kind: AccessKeyPermissionKind;
};
