import { Network } from 'nb-types';

import { Chains } from '#types/enum';

export interface Config {
  chains: {
    [key in Chains]: {
      concurrency: number;
      interval: number;
      start: number;
      url: string;
    };
  };
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  insertLimit: number;
  network: Network;
  sentryDsn?: string;
}

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

export type EvmTransaction = {
  from: string;
  hash: string;
  r: string;
  s: string;
  v: string;
};

export type EvmBlock = {
  number: string;
  timestamp: string;
  transactions: EvmTransaction[];
};

export type BitcoinRpcRequest = {
  id: string;
  jsonrpc: '2.0';
  method: string;
  params: unknown[];
};

export type BitcoinRpcResponse<T> = {
  error?: { code: number; message: string };
  id: string;
  result: T;
};

export type BitcoinVin = {
  scriptSig?: { asm: string; hex: string };
  txinwitness?: string[];
};

export type BitcoinTransaction = {
  txid: string;
  vin: BitcoinVin[];
};

export type BitcoinBlock = {
  height: number;
  time: number;
  tx: BitcoinTransaction[];
};

export type SolanaRpcRequest = {
  id: number;
  jsonrpc: '2.0';
  method: string;
  params?: unknown[];
};

export type SolanaRpcResponse<T> = {
  error?: {
    code: number;
    message: string;
  };
  id: number;
  jsonrpc: '2.0';
  result?: T;
};

export type SolanaAccountKey = {
  pubkey: string;
  signer: boolean;
  source: string;
  writable: boolean;
};

export type SolanaTransaction = {
  transaction: {
    accountKeys: SolanaAccountKey[];
    signatures: string[];
  };
};

export type SolanaBlock = {
  blockHeight: number;
  blockTime: number;
  transactions: SolanaTransaction[];
};

export type ZcashRpcRequest = {
  id: string;
  jsonrpc: '2.0';
  method: string;
  params: unknown[];
};

export type ZcashRpcResponse<T> = {
  error?: { code: number; message: string };
  id: string;
  result: T;
};

export type ZcashVin = {
  scriptSig?: { asm: string; hex: string };
};

export type ZcashTransaction = {
  txid: string;
  vin: ZcashVin[];
};

export type ZcashBlock = {
  height: number;
  time: number;
  tx: ZcashTransaction[];
};

export type BlockProcess = {
  chain: Chains;
  height: number;
  url: string;
};

export type SyncOptions = {
  chain: Chains;
  concurrency: number;
  getTip: (url: string) => Promise<number>;
  interval: number;
  processBlock: (params: BlockProcess) => Promise<void>;
  start: number;
  url: string;
};

export type RetryOptions = {
  chain?: Chains;
  label?: string;
  onError?: (context: RetryErrorContext) => Promise<void>;
  retries?: number;
};

export type RetryInputContext = {
  attempts: number;
};

export type RetryErrorContext = {
  attempts: number;
  chain?: Chains;
  error: unknown;
  label?: string;
  retries: number;
};
