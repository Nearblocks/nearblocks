import { Dayjs } from 'dayjs';

import { FTEvent, Network } from 'nb-types';

export interface Config {
  cmcApiKey: string;
  coingeckoApiKey?: string;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  genesisDate: string;
  genesisHeight: number;
  lcwApiKey: string;
  network: Network;
  rpcUrl: string;
  rpcUrl2: string;
  sentryDsn?: string;
}

export type SnapshotStartParams = {
  date: Dayjs;
  index: null | string;
};

export type SnapshotEvent = Pick<
  FTEvent,
  'affected_account_id' | 'block_height' | 'contract_account_id' | 'event_index'
>;
