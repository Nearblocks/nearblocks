import { fetcher } from '@/hooks/useFetch';

const getRoute = (filter: string) => {
  switch (filter) {
    case 'txns':
      return 'txns';
    case 'blocks':
      return 'blocks';
    case 'accounts':
      return 'accounts';
    default:
      return '';
  }
};

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

    return returnPath ? null : data;
  } catch (error) {
    console.log({ error });
    return returnPath ? null : {};
  }
};

export default search;
