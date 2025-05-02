import { Network } from 'nb-types';

import { Chains } from '#types/enum';

export interface Config {
  chains: {
    [key in Chains]: {
      interval: number;
      start: number;
      url: string;
    };
  };
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlRead: string;
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
  timestamp: number;
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

export type SolanaTransaction = {
  transaction: {
    message: {
      accountKeys: string[];
    };
    signatures: string[];
  };
};

export type SolanaBlock = {
  blockHeight: number;
  blockTime: number;
  transactions: SolanaTransaction[];
};

export type BlockProcess = {
  chain: Chains;
  height: number;
  interval: number;
  url: string;
};

export type RetryOptions = {
  onError?: (context: RetryErrorContext) => Promise<void>;
  retries?: number;
};

export type RetryInputContext = {
  attempts: number;
};

export type RetryErrorContext = {
  attempts: number;
  error: unknown;
  retries: number;
};
