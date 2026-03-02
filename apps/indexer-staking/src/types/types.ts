import { Network, StakingEventType } from 'nb-types';

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlBase: string;
  indexerKey: string;
  neardataUrl?: string;
  network: Network;
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
