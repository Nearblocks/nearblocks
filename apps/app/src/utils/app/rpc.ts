import { baseDecode } from 'borsh';
import { providers } from 'near-api-js';

import { SearchResult } from '../types';
import { networkId } from './config';
import { isValidAccount } from './libs';

export const RpcProviders =
  networkId === 'mainnet'
    ? [
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

type response = {
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

export const rpcSearch = async (
  rpcUrl: string,
  keyword: string,
): Promise<SearchResponse> => {
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
      ? getAccount(rpcUrl, keyword.toLocaleLowerCase())
      : undefined,
    isQueryLong
      ? getBlock(rpcUrl, keyword)
      : !isNaN(+keyword)
      ? getBlock(rpcUrl, +keyword)
      : undefined,
    isQueryLong ? getTxn(rpcUrl, keyword) : undefined,
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
    data.txns = [{ transaction_hash: txn?.transaction?.hash }];
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

export const getAccount = async (rpc: string, accountId: string) => {
  try {
    const jsonProviders = [new providers.JsonRpcProvider({ url: rpc })];

    const provider = new providers.FailoverRpcProvider(jsonProviders);

    const data = await provider.query({
      account_id: accountId,
      finality: 'final',
      request_type: 'view_account',
    });

    return data;
  } catch (error) {
    console.log({ error });
    return;
  }
};

export const getBlock = async (rpc: string, blockId: number | string) => {
  try {
    const jsonProviders = [new providers.JsonRpcProvider({ url: rpc })];

    const provider = new providers.FailoverRpcProvider(jsonProviders);

    const block = await provider.block({ blockId });

    return block;
  } catch (error) {
    console.log({ error });
    return;
  }
};

export const getTxn = async (rpc: string, txnHash: string) => {
  try {
    const jsonProviders = [new providers.JsonRpcProvider({ url: rpc })];

    const provider = new providers.FailoverRpcProvider(jsonProviders);

    const data = await provider.txStatusReceipts(
      Uint8Array.from(baseDecode(txnHash)),
      'bowen',
      'NONE',
    );

    return data;
  } catch (error) {
    console.log({ error });
    return;
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
    console.log({ error });
    return;
  }
};
