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
  fastnearEndpoint?: string;
  genesisHeight: number;
  insertLimit: number;
  network: Network;
  preloadSize: number;
  redisPassword: string;
  redisSentinelName: string;
  redisSentinelUrls: string;
  redisUrl: string;
  s3BucketName: string;
  s3Endpoint: null | types.EndpointConfig;
  s3RegionName: string;
  sentryDsn?: string;
  startBlockHeight: number;
}

export type Sign = {
  request: SignRequest;
};

export type SignRequest = {
  path: string;
};
