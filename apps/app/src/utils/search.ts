import { SearchResult, SearchRoute } from './types';

export async function search(
  keyword: string,
  filter: string,
  returnPath?: boolean,
  url?: string,
): Promise<SearchResult | SearchRoute | null> {
  const route = getRoute(filter);

  try {
    const response = await fetch(`${url}search/${route}?keyword=${keyword}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resp = await response.json();

    if (!resp) {
      return returnPath
        ? null
        : { blocks: [], txns: [], accounts: [], receipts: [] };
    }

    if (resp.blocks?.length) {
      return returnPath
        ? { type: 'block', path: resp.blocks[0].block_hash }
        : { blocks: resp.blocks, txns: [], accounts: [], receipts: [] };
    }

    if (resp.txns?.length) {
      return returnPath
        ? { type: 'txn', path: resp.txns[0].transaction_hash }
        : { blocks: [], txns: resp.txns, accounts: [], receipts: [] };
    }

    if (resp.receipts?.length) {
      return returnPath
        ? {
            type: 'txn',
            path: resp.receipts[0].originated_from_transaction_hash,
          }
        : { blocks: [], txns: [], accounts: [], receipts: resp.receipts };
    }

    if (resp.accounts?.length) {
      return returnPath
        ? { type: 'address', path: resp.accounts[0].account_id }
        : { blocks: [], txns: [], accounts: resp.accounts, receipts: [] };
    }

    return returnPath
      ? null
      : { blocks: [], txns: [], accounts: [], receipts: [] };
  } catch (err) {
    console.error({ err });
    return null;
  }
}

function getRoute(filter: string): string {
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
}
