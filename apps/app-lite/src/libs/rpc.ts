import {
  RPC,
  RpcResponse,
  RpcResultAccount,
  RpcResultBlock,
  RpcResultReceipt,
  RpcResultTxn,
} from 'nb-near';
import { Network } from 'nb-types';

import config from '@/config';

export const providers =
  config.network === Network.MAINNET
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
          name: 'fast-near web4',
          url: 'https://rpc.web4.near.page',
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
          name: 'Lavender.Five',
          url: 'https://near.lavenderfive.com/',
        },
        {
          name: 'dRPC',
          url: 'https://near.drpc.org',
        },
        {
          name: 'OMNIA',
          url: 'https://endpoints.omniatech.io/v1/near/mainnet/public',
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
        {
          name: 'NEAR (Beta)',
          url: 'https://beta.rpc.testnet.near.org',
        },
      ];

export const getAccount = async (rpc: RPC, accountId: string) => {
  try {
    const { data } = await rpc.query({
      account_id: accountId,
      finality: 'final',
      request_type: 'view_account',
    });

    return data as RpcResponse<RpcResultAccount>;
  } catch (error) {
    console.log({ error });
    return;
  }
};

export const getBlock = async (rpc: RPC, blockId: number | string) => {
  try {
    const { data } = await rpc.query({ block_id: blockId }, 'block');

    return data as RpcResponse<RpcResultBlock>;
  } catch (error) {
    console.log({ error });
    return;
  }
};

export const getTxn = async (rpc: RPC, txnHash: string) => {
  try {
    const { data } = await rpc.query(
      { sender_account_id: 'bowen', tx_hash: txnHash, wait_until: 'NONE' },
      'tx',
    );

    return data as RpcResponse<RpcResultTxn>;
  } catch (error) {
    console.log({ error });
    return;
  }
};

export const getReceipt = async (rpc: RPC, receiptId: string) => {
  try {
    const { data } = await rpc.query(
      { receipt_id: receiptId },
      'view_receipt_record',
    );

    return data as RpcResponse<RpcResultReceipt>;
  } catch (error) {
    console.log({ error });
    return;
  }
};
