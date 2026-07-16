import { Network } from 'nb-types';

export type Config = {
  backfillWindowSize: bigint;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbSchema: string;
  dbUrl: string;
  genesisFile: string;
  genesisHeight: number;
  genesisTimestamp: string;
  insertLimit: number;
  neardataConcurrency: 'auto' | number;
  neardataUrl: string;
  network: Network;
  sentryDsn?: string;
  startBlockHeight: number;
};
