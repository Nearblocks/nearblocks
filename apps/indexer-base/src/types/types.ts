import { AccessKeyPermissionKind, Network } from 'nb-types';

export interface Config {
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
}

export type AccessKeyPermission = {
  permission_details?: {
    allowance: string;
    method_names: string[];
    receiver_id: string;
  };
  permission_kind: AccessKeyPermissionKind;
};
