import { Network, StakingEventType } from 'nb-types';

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlRead: string;
  network: Network;
  s3AccessKey: string;
  s3Bucket: string;
  s3Endpoint: string;
  s3Region: string;
  s3SecretKey: string;
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
