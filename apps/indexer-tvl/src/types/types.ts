import { Network } from 'nb-types';

import { EvmChains } from '#types/enum';

export interface Config {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  evm: {
    [key in EvmChains]: {
      chunkDelayMs: number;
      logChunkBlocks: number;
      url: string;
    };
  };
  intervalMs: number;
  network: Network;
  sentryDsn?: string;
  snapshotDayDelayMs: number;
  solanaPageDelayMs: number;
  solanaTxDelayMs: number;
  solanaUrl: string;
}

// tvl_sources row
export type Source = {
  address: string;
  chain: string;
  protocol: string;
  start_block: null | string;
};

export type Token = {
  chain: string;
  coingecko_id: null | string;
  decimals: null | number;
  first_seen_block: null | string;
  first_seen_date: null | string;
  protocol: string;
  symbol: null | string;
  token: string;
};

export type RetryInputContext = {
  attempts: number;
};

export type RetryErrorContext = {
  attempts: number;
  error: unknown;
  label?: string;
  retries: number;
};

export type RetryOptions = {
  label?: string;
  onError?: (context: RetryErrorContext) => Promise<void>;
  retries?: number;
};

export type EvmRpcRequest = {
  id: number;
  jsonrpc: string;
  method: string;
  params: unknown[];
};

export type EvmRpcResponse<T> = {
  error?: { message: string };
  id: number;
  jsonrpc: string;
  result?: T;
};

export type EvmBlockHeader = {
  number: string;
  timestamp: string;
};

export type EvmLog = {
  address: string;
  blockNumber: string;
  data: string;
  topics: string[];
  transactionHash: string;
};

export type SolanaRpcRequest = {
  id: number;
  jsonrpc: '2.0';
  method: string;
  params?: unknown[];
};

export type SolanaRpcResponse<T> = {
  error?: { code: number; message: string };
  id: number;
  jsonrpc: '2.0';
  result?: T;
};

export type SolanaSignatureInfo = {
  blockTime: null | number;
  err: null | unknown;
  signature: string;
  slot: number;
};

export type SolanaTokenBalance = {
  accountIndex: number;
  mint: string;
  owner?: string;
  uiTokenAmount: { amount: string; decimals: number };
};

export type SolanaTransaction = {
  blockTime: null | number;
  meta: {
    postBalances: number[];
    postTokenBalances: SolanaTokenBalance[];
  } | null;
  slot: number;
};
