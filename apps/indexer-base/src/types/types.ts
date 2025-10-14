import { types } from '@near-lake/framework';

import { AccessKeyPermissionKind, Network } from 'nb-types';

export interface Config {
  dataSource: string;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  delta: number;
  disableAutoSwitch: boolean;
  disableS3Upload: boolean;
  fastnearApiKey: string;
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
  s3AccessKey: string;
  s3Bucket: string;
  s3Endpoint: string;
  s3Region: string;
  s3SecretKey: string;
  sentryDsn?: string;
  startBlockHeight: number;
}

export type AccessKeyPermission = {
  permission_details?: {
    allowance: string;
    method_names: string[];
    receiver_id: string;
  };
  permission_kind: AccessKeyPermissionKind;
};
