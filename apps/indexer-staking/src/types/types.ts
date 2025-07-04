import { Network, StakingEventType } from 'nb-types';

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlBase: string;
  indexerKey: string;
  network: Network;
  s3AccessKey: string;
  s3Bucket: string;
  s3Host: string;
  s3Port: number;
  s3SecretKey: string;
  s3UseSsl: boolean;
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
