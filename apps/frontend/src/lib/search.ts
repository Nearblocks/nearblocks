import { Search } from 'nb-schemas';

import {
  search,
  searchAccounts,
  searchBlocks,
  searchFTs,
  searchKeys,
  searchMTs,
  searchNFTs,
  searchReceipts,
  searchTxns,
} from '@/actions/search';

export const initialResults: Search = {
  accounts: [],
  blocks: [],
  fts: [],
  keys: [],
  mts: [],
  nfts: [],
  receipts: [],
  txns: [],
};

const FILTERS = {
  addresses: { fetch: searchAccounts, key: 'accounts' },
  blocks: { fetch: searchBlocks, key: 'blocks' },
  keys: { fetch: searchKeys, key: 'keys' },
  mts: { fetch: searchMTs, key: 'mts' },
  nfts: { fetch: searchNFTs, key: 'nfts' },
  receipts: { fetch: searchReceipts, key: 'receipts' },
  tokens: { fetch: searchFTs, key: 'fts' },
  txns: { fetch: searchTxns, key: 'txns' },
} as const satisfies Record<
  string,
  { fetch: (keyword: string) => Promise<unknown[]>; key: keyof Search }
>;

export const searchKeyword = async (
  keyword: string,
  filter: string,
): Promise<null | Search> => {
  const entry = FILTERS[filter as keyof typeof FILTERS];

  if (!entry) return search(keyword);

  const rows = await entry.fetch(keyword);

  return { ...initialResults, [entry.key]: rows };
};
