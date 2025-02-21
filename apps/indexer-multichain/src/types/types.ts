import { Network } from 'nb-types';

export interface Config {
  cacheExpiry: number;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlRead: string;
  delta: number;
  insertLimit: number;
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

export type Sign = {
  request: SignRequest;
};

export type SignRequest = {
  path: string;
};
