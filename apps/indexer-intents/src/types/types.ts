import { Network } from 'nb-types';

export interface Config {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlBase: string;
  intentsStartTimestamp: string;
  network: Network;
  sentryDsn?: string;
}

export interface IntentsSwap {
  account_id: string;
  block_timestamp: string;
  delta_amount: string;
  event_index: number;
  fee_amount: null | string;
  receipt_id: string;
  referral: null | string;
  shard_id: number;
  token_id: string;
}
