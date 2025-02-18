import { types } from 'near-lake-framework';

import { Network } from 'nb-types';

export interface Config {
  cacheExpiry: number;
  dataSource: string;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  delta: number;
  endBlockHeight: number;
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
  s3Endpoint: string;
  s3Region: string;
  s3SecretKey: string;
  sentryDsn?: string;
  startBlockHeight: number;
}
