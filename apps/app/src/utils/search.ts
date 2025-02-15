import { fetcher } from '@/hooks/useFetch';
import { isValidAccount } from './libs';
import { getAccount, getBlock, getReceipt, getTxn } from './rpc';
import { Account } from './types';
import { networkId } from './config';

const getRoute = (filter: string) => {
  switch (filter) {
    case 'txns':
      return 'txns';
    case 'blocks':
      return 'blocks';
    case 'accounts':
      return 'accounts';
    case 'tokens':
      return 'tokens';
    default:
      return '';
  }
};

const receiptRpc =
  networkId === 'mainnet'
    ? `https://beta.rpc.mainnet.near.org`
    : `https://beta.rpc.testnet.near.org')`;

const search = async (
  keyword: string,
  filter: string,
  returnPath?: boolean,
) => {
  try {
    const route = getRoute(filter);

    if (keyword.includes('.')) {
      keyword = keyword.toLowerCase();
    }

    const resp = await fetcher(`/search/${route}?keyword=${keyword}`);

    const data = {
      blocks: [],
      txns: [],
      accounts: [],
      receipts: [],
      tokens: [],
    };

    if (resp?.blocks?.length) {
      if (returnPath) {
        return { type: 'block', path: resp.blocks[0].block_hash };
      }
      data.blocks = resp.blocks;
    }

    if (resp?.txns?.length) {
      if (returnPath) {
        return { type: 'txn', path: resp.txns[0].transaction_hash };
      }
      data.txns = resp.txns;
    }

    if (resp?.receipts?.length) {
      if (returnPath) {
        return {
          type: 'txn',
          path: resp.receipts[0].originated_from_transaction_hash,
        };
      }
      data.receipts = resp.receipts;
    }

    if (resp?.accounts?.length) {
      if (returnPath) {
        return { type: 'address', path: resp.accounts[0].account_id };
      }
      data.accounts = resp.accounts;
    }

    if (resp?.tokens?.length) {
      if (returnPath) {
        return { type: 'token', path: resp.tokens[0].contract };
      }
      data.tokens = resp.tokens;
    }

    return returnPath ? null : data;
  } catch (error) {
    console.log({ error });
    return returnPath ? null : {};
  }
};

type RpcSearchResult = {
  blocks: { block_hash: string; block_height: number }[];
  txns: { transaction_hash: string }[];
  accounts: Account[];
  receipts: { receipt_id: string; originated_from_transaction_hash: string }[];
  tokens: [];
};

export const rpcSearch = async (
  rpcUrl: string,
  keyword: string,
  returnPath?: boolean,
) => {
  const data: RpcSearchResult = {
    blocks: [],
    txns: [],
    accounts: [],
    receipts: [],
    tokens: [],
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
      return { type: 'address', path: keyword.toLocaleLowerCase() };
    }
    data.accounts = [
      {
        account_id: keyword.toLocaleLowerCase(),
        amount: '',
        code_hash: '',
        locked: '',
        storage_paid_at: 0,
        storage_usage: 0,
        block_hash: '',
        block_height: 0,
      },
    ];
  }

  if (block) {
    if (returnPath) {
      return { type: 'block', path: block?.header?.hash };
    }
    data.blocks = [
      { block_hash: block?.header?.hash, block_height: block?.header?.height },
    ];
  }

  if (txn) {
    if (returnPath) {
      return { type: 'txn', path: txn?.transaction?.hash };
    }
    data.txns = [{ transaction_hash: txn?.transaction?.hash }];
  }

  if (receipt) {
    if (returnPath) {
      return {
        type: 'txn',
        path: receipt?.parent_transaction_hash,
      };
    }
    data.receipts = [
      {
        receipt_id: receipt?.receipt_id,
        originated_from_transaction_hash: receipt?.parent_transaction_hash,
      },
    ];
  }

  return returnPath ? null : data;
};

export default search;
