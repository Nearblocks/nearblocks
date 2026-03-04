import { Network } from 'nb-types';

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  genesisFile: string;
  genesisHeight: number;
  genesisTimestamp: string;
  insertLimit: number;
  neardataUrl: string;
  network: Network;
  sentryDsn?: string;
  startBlockHeight: number;
};
