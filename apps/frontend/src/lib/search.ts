import { SearchRes } from 'nb-schemas';

import {
  search,
  searchAccounts,
  searchBlocks,
  searchFTs,
  searchKeys,
  searchNFTs,
  searchReceipts,
  searchTxns,
} from '@/actions/search';

export const initialResults: SearchRes['data'] = {
  accounts: [],
  blocks: [],
  fts: [],
  keys: [],
  nfts: [],
  receipts: [],
  txns: [],
};

export const searchKeyword = async (keyword: string, filter: string) => {
  const results = initialResults;

  if (filter === 'accounts') {
    results.accounts = await searchAccounts(keyword);
  }

  if (filter === 'blocks') {
    results.blocks = await searchBlocks(keyword);
  }

  if (filter === 'keys') {
    results.keys = await searchKeys(keyword);
  }

  if (filter === 'nfts') {
    results.nfts = await searchNFTs(keyword);
  }

  if (filter === 'receipts') {
    results.receipts = await searchReceipts(keyword);
  }

  if (filter === 'tokens') {
    results.fts = await searchFTs(keyword);
  }

  if (filter === 'txns') {
    results.txns = await searchTxns(keyword);
  }

  return search(keyword);
};
