import { baseDecode } from 'borsh';
import { networkId } from './config';
import { providers } from 'near-api-js';

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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'view_receipt_record',
        params: {
          receipt_id: receiptId,
        },
      }),
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
