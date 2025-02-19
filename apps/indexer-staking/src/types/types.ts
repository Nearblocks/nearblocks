import { types } from 'nb-lake';
import { Network, StakingEventType } from 'nb-types';

export type Config = {
  cacheExpiry: number;
  dataSource: string;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  delta: number;
  genesisHeight: number;
  insertLimit: number;
  network: Network;
  preloadSize: number;
  s3BucketName: string;
  s3Endpoint: null | types.EndpointConfig;
  s3RegionName: string;
  sentryDsn?: string;
  startBlockHeight: number;
};

export type Event = {
  account?: string;
  amount?: string;
  contractShares?: string;
  contractStaked?: string;
  shares?: string;
  totalShares?: string;
  totalUnstaked?: string;
  type: StakingEventType;
};
