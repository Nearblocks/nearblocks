import type { RpcResultAccount, RpcResultBlock, RpcResultTxn } from 'nb-near';
import { Network } from 'nb-types';

import { rpcFetch } from './fetcher';

export const getProviders = (network: string) => {
  return network === Network.MAINNET
    ? [
        {
          name: 'FASTNEAR',
          url: 'https://free.rpc.fastnear.com',
        },
        {
          name: 'FASTNEAR (Archival)',
          url: 'https://archival-rpc.mainnet.fastnear.com',
        },
        {
          name: 'NEAR',
          url: 'https://rpc.mainnet.near.org',
        },
        {
          name: 'NEAR (Archival)',
          url: 'https://archival-rpc.mainnet.near.org',
        },
        {
          name: 'Intear RPC',
          url: 'https://rpc.intea.rs',
        },
        {
          name: 'Shitzu',
          url: 'https://rpc.shitzuapes.xyz',
        },
      ]
    : [
        {
          name: 'FASTNEAR',
          url: 'https://test.rpc.fastnear.com',
        },
        {
          name: 'NEAR',
          url: 'https://rpc.testnet.near.org',
        },
        {
          name: 'NEAR (Archival)',
          url: 'https://archival-rpc.testnet.near.org',
        },
        {
          name: 'Intear RPC',
          url: 'https://testnet-rpc.intea.rs',
        },
      ];
};

const isNodeError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  typeof (error as { cause?: { name?: unknown } }).cause?.name === 'string';

const lookup = async <T>(
  rpcUrl: string,
  method: string,
  params: unknown,
  signal: AbortSignal,
): Promise<T | undefined> => {
  try {
    return await rpcFetch<T>(rpcUrl, method, params, { retries: 0, signal });
  } catch (error) {
    if (isNodeError(error)) return undefined;

    throw error;
  }
};

export const getAccount = (
  rpcUrl: string,
  accountId: string,
  signal: AbortSignal,
) =>
  lookup<RpcResultAccount>(
    rpcUrl,
    'query',
    { account_id: accountId, finality: 'final', request_type: 'view_account' },
    signal,
  );

export const getBlock = (
  rpcUrl: string,
  blockId: number | string,
  signal: AbortSignal,
) => lookup<RpcResultBlock>(rpcUrl, 'block', { block_id: blockId }, signal);

export const getTxn = (rpcUrl: string, txnHash: string, signal: AbortSignal) =>
  lookup<RpcResultTxn>(
    rpcUrl,
    'tx',
    { sender_account_id: 'bowen', tx_hash: txnHash, wait_until: 'NONE' },
    signal,
  );
