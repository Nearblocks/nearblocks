import { types } from '@near-lake/framework';

import { Network } from 'nb-types';

export interface Config {
  dataSource: string;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  // Temp stream from s3
  dbUrlBase: string;
  dbUrlRead: string;
  delta: number;
  disableAutoSwitch: boolean;
  disableS3Upload: boolean;
  fastnearEndpoint?: string;
  genesisHeight: number;
  indexerKey: string;
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
  s3Host: string;
  s3Port: number;
  s3SecretKey: string;
  s3UseSsl: boolean;
  sentryDsn?: string;
  startBlockHeight: number;
}
