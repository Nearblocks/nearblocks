import { Network } from 'nb-types';

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  // Temp stream from s3
  dbUrlBase: string;
  dbUrlRead: string;
  delta: number;
  genesisFile: string;
  genesisTimestamp: string;
  insertLimit: number;
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
