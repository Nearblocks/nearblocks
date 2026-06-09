import { Network } from 'nb-types';

export interface Config {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  network: Network;
  sentryDsn?: string;
}
