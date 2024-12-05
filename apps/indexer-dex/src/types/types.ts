import { DexPairs, Network } from 'nb-types';

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlRead: string;
  NEAR_TOKEN: string;
  network: Network;
  sentryDsn?: string;
  STABLE_TOKENS: string[];
  startBlockHeight: number;
};

export type SwapArgs = {
  actions: Action[];
};

export type HotZapArgs = {
  hot_zap_actions: Action[];
};

export type FtOnTransferArgs = {
  msg: string;
  sender_id: string;
};

export type PoolArgs = {
  tokens: string[];
};

export type Action = {
  pool_id: number | string;
};

export type SwapPair = {
  baseAmount: string;
  baseToken: string;
  quoteAmount: string;
  quoteToken: string;
};

export type DexPairMeta = DexPairs & {
  baseDecimal: number;
  quoteDecimal: number;
};
