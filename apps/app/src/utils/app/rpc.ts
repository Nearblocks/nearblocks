'use server';

import { baseDecode } from 'borsh';
import { providers } from 'near-api-js';

import { networkId, fastNearRpcKey } from './config';

export const getRpcProviders = async () => {
  return networkId === 'mainnet'
    ? [
        {
          name: 'FastNEAR (Archival)',
          url: `https://archival-rpc.mainnet.fastnear.com${
            fastNearRpcKey ? `?apiKey=${fastNearRpcKey}` : ''
          }`,
        },
        {
          name: 'FASTNEAR Free',
          url: 'https://free.rpc.fastnear.com',
        },
        {
          name: 'Lava Network',
          url: 'https://near.lava.build',
        },
      ]
    : [
        {
          name: 'FastNEAR (Archival)',
          url: `https://archival-rpc.testnet.fastnear.com${
            fastNearRpcKey ? `?apiKey=${fastNearRpcKey}` : ''
          }`,
        },
      ];
};

const RpcProviders = await getRpcProviders();
const jsonProviders = RpcProviders.map(
  (p) => new providers.JsonRpcProvider({ url: p.url }, { retries: 0 }),
);

const provider = new providers.FailoverRpcProvider(jsonProviders);
export const getAccount = async (accountId: string) => {
  try {
    const data = await provider.query({
      account_id: accountId,
      finality: 'final',
      request_type: 'view_account',
    });

    return data;
  } catch (error) {
    return null;
  }
};

export const getBlock = async (blockId: number | string) => {
  try {
    const block = await provider.block({ blockId });
    return block;
  } catch (error) {
    return null;
  }
};

export const getTxn = async (txnHash: string) => {
  try {
    const data = await provider.txStatusReceipts(
      Uint8Array.from(baseDecode(txnHash)),
      'bowen',
      'NONE',
    );
    return data;
  } catch (error) {
    return null;
  }
};

export const getReceipt = async (rpc: string, receiptId: string) => {
  try {
    const response = await fetch(rpc, {
      body: JSON.stringify({
        id: 'dontcare',
        jsonrpc: '2.0',
        method: 'view_receipt_record',
        params: {
          receipt_id: receiptId,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data?.result;
  } catch (error) {
    return null;
  }
};
