export interface Config {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  ftHoldersTable: string;
  nftHoldersTable: string;
  sentryDsn?: string;
  tpsTable: string;
}
