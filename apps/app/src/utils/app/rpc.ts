import { baseDecode } from 'borsh';
import { providers } from 'near-api-js';

import { Account } from '../types';
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

type RpcSearchResult = {
  accounts: Account[];
  blocks: { block_hash: string; block_height: number }[];
  receipts: { originated_from_transaction_hash: string; receipt_id: string }[];
  tokens: [];
  txns: { transaction_hash: string }[];
};

const receiptRpc =
  networkId === 'mainnet'
    ? `https://beta.rpc.mainnet.near.org`
    : `https://beta.rpc.testnet.near.org')`;

export const rpcSearch = async (
  rpcUrl: string,
  keyword: string,
  returnPath?: boolean,
) => {
  const data: RpcSearchResult = {
    accounts: [],
    blocks: [],
    receipts: [],
    tokens: [],
    txns: [],
  };

  const isQueryLong = keyword.length >= 43;

  const [account, block, txn, receipt] = await Promise.all([
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
    if (returnPath) {
      return { path: keyword.toLocaleLowerCase(), type: 'address' };
    }
    data.accounts = [
      {
        account_id: keyword.toLocaleLowerCase(),
        amount: '',
        block_hash: '',
        block_height: 0,
        code_hash: '',
        locked: '',
        storage_paid_at: 0,
        storage_usage: 0,
      },
    ];
  }

  if (block) {
    if (returnPath) {
      return { path: block?.header?.hash, type: 'block' };
    }
    data.blocks = [
      {
        block_hash: block?.header?.hash,
        block_height: block?.header?.height,
      },
    ];
  }

  if (txn) {
    if (returnPath) {
      return { path: txn?.transaction?.hash, type: 'txn' };
    }
    data.txns = [{ transaction_hash: txn?.transaction?.hash }];
  }

  if (receipt) {
    if (returnPath) {
      return {
        path: receipt?.parent_transaction_hash,
        type: 'txn',
      };
    }
    data.receipts = [
      {
        originated_from_transaction_hash: receipt?.parent_transaction_hash,
        receipt_id: receipt?.receipt_id,
      },
    ];
  }

  return data;
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
