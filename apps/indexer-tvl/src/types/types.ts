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

export type Source = {
  address: string;
  authority: null | string;
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
    loadedAddresses?: { readonly: string[]; writable: string[] };
    postTokenBalances: SolanaTokenBalance[];
  } | null;
  slot: number;
  transaction: {
    message: {
      accountKeys: string[];
    };
  };
};

export type SolanaTokenAccount = {
  decimals: number;
  mint: string;
  pubkey: string;
};

export type SolanaAccount = {
  ata: string;
  chain: string;
  decimals: number;
  mint: string;
  newest_signature: null | string;
  protocol: string;
  scan_before: null | string;
  scan_complete: boolean;
};

export type SolanaDayTx = {
  amount: null | string;
  ata: string;
  chain: string;
  date: string;
  protocol: string;
  resolved: boolean;
  signature: string;
};
