import fetcher from './fetcher';

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

    const resp = await fetcher(`search/${route}?keyword=${keyword}`);

    const data = {
      accounts: [],
      blocks: [],
      receipts: [],
      txns: [],
    };

    if (resp?.blocks?.length) {
      if (returnPath) {
        return { path: resp?.blocks[0]?.block_hash, type: 'block' };
      }
      data.blocks = resp?.blocks;
    }

    if (resp?.txns?.length) {
      if (returnPath) {
        return { path: resp?.txns[0]?.transaction_hash, type: 'txn' };
      }
      data.txns = resp?.txns;
    }

    if (resp?.receipts?.length) {
      if (returnPath) {
        return {
          path: resp?.receipts[0]?.originated_from_transaction_hash,
          type: 'txn',
        };
      }
      data.receipts = resp?.receipts;
    }

    if (resp?.accounts?.length) {
      if (returnPath) {
        return { path: resp?.accounts[0]?.account_id, type: 'address' };
      }
      data.accounts = resp?.accounts;
    }

    return returnPath ? null : data;
  } catch (error) {
    console.log({ error });
    return returnPath ? null : {};
  }
};

export default search;
