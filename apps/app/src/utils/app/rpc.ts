'use server';

import { baseDecode } from 'borsh';
import { providers } from 'near-api-js';

import { SearchResult } from '../types';
import { networkId, rpcKey } from './config';
import { isValidAccount } from './libs';

export const getRpcProviders = async () => {
  return networkId === 'mainnet'
    ? [
        {
          name: 'FastNEAR (Archival)',
          url: `https://rpc.mainnet.fastnear.com?apiKey=${rpcKey}`,
        },
        {
          name: 'NEAR (Archival)',
          url: 'https://archival-rpc.mainnet.near.org',
        },
        {
          name: 'NEAR',
          url: 'https://rpc.mainnet.near.org',
        },
        {
          name: 'NEAR (Beta)',
          url: 'https://beta.rpc.mainnet.near.org',
        },
        {
          name: 'FASTNEAR Free',
          url: 'https://free.rpc.fastnear.com',
        },
        {
          name: 'Lava Network',
          url: 'https://near.lava.build',
        },
        {
          name: 'dRPC',
          url: 'https://near.drpc.org',
        },
      ]
    : [
        {
          name: 'NEAR (Archival)',
          url: 'https://archival-rpc.testnet.near.org',
        },
        {
          name: 'NEAR',
          url: 'https://rpc.testnet.near.org',
        },
      ];
};

type response = {
  final_execution_status: string;
  receipt_id: string;
  parent_transaction_hash: string;
  transaction: {
    hash: string;
  };
  header: {
    height: number;
    hash: string;
  };
};

const receiptRpc =
  networkId === 'mainnet'
    ? `https://beta.rpc.mainnet.near.org`
    : `https://beta.rpc.testnet.near.org')`;

type SearchResponse =
  | { data: SearchResult; keyword: string; loading: boolean }
  | { data: null; loading: boolean };

export const rpcSearch = async (keyword: string): Promise<SearchResponse> => {
  const data: SearchResult = {
    accounts: [],
    blocks: [],
    receipts: [],
    tokens: [],
    txns: [],
  };

  const isQueryLong = keyword.length >= 43;

  const [account, block, txn, receipt]: response[] = await Promise.all([
    isValidAccount(keyword.toLocaleLowerCase())
      ? getAccount(keyword.toLocaleLowerCase())
      : undefined,
    isQueryLong
      ? getBlock(keyword)
      : !isNaN(+keyword)
      ? getBlock(+keyword)
      : undefined,
    isQueryLong ? getTxn(keyword) : undefined,
    isQueryLong ? getReceipt(receiptRpc, keyword) : undefined,
  ]);

  if (account) {
    data.accounts = [
      {
        account_id: keyword.toLocaleLowerCase(),
      },
    ];
  }

  if (block) {
    data.blocks = [
      {
        block_hash: block?.header?.hash,
        block_height: block?.header?.height,
      },
    ];
  }

  if (txn) {
    if (txn?.final_execution_status !== 'NONE') {
      data.txns = [{ transaction_hash: txn?.transaction?.hash }];
    }
  }

  if (receipt) {
    data.receipts = [
      {
        originated_from_transaction_hash: receipt?.parent_transaction_hash,
        receipt_id: receipt?.receipt_id,
      },
    ];
  }
  const hasValidData = Object.values(data).some(
    (value) => Array.isArray(value) && value.length > 0,
  );

  return hasValidData
    ? { data, keyword, loading: false }
    : { data: null, loading: false };
};
const RpcProviders = await getRpcProviders();
const jsonProviders = RpcProviders.map(
  (p) => new providers.JsonRpcProvider({ url: p.url }),
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
