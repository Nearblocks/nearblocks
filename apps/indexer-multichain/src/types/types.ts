import { Network } from 'nb-types';

export interface Config {
  cacheExpiry: number;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlRead: string;
  delta: number;
  genesisHeight: number;
  insertLimit: number;
  network: Network;
  preloadSize: number;
  redisPassword: string;
  redisSentinelName: string;
  redisSentinelUrls: string;
  redisUrl: string;
  sentryDsn?: string;
  startBlockHeight: number;
}

export type Sign = {
  request: SignRequest;
};

export type SignRequest = {
  path: string;
};
