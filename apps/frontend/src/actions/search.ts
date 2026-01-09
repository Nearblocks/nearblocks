'use server';

import {
  SearchAccountRes,
  SearchBlockRes,
  SearchFTRes,
  SearchKeyRes,
  SearchNFTRes,
  SearchReceiptRes,
  SearchRes,
  SearchTxnRes,
} from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const search = async (keyword: string) => {
  if (!keyword || keyword.trim().length < 2) return null;

  const resp = await fetcher<SearchRes>(`/v3/search?keyword=${keyword}`);

  return resp.data;
};

export const searchBlocks = async (keyword: string) => {
  if (!keyword || keyword.trim().length < 2) return [];

  const resp = await fetcher<SearchBlockRes>(
    `/v3/search/blocks?keyword=${keyword}`,
  );

  return resp.data || [];
};

export const searchTxns = async (keyword: string) => {
  if (!keyword || keyword.trim().length < 2) return [];

  const resp = await fetcher<SearchTxnRes>(
    `/v3/search/txns?keyword=${keyword}`,
  );

  return resp.data || [];
};

export const searchAccounts = async (keyword: string) => {
  if (!keyword || keyword.trim().length < 2) return [];

  const resp = await fetcher<SearchAccountRes>(
    `/v3/search/accounts?keyword=${keyword}`,
  );

  return resp.data || [];
};

export const searchFTs = async (keyword: string) => {
  if (!keyword || keyword.trim().length < 2) return [];

  const resp = await fetcher<SearchFTRes>(`/v3/search/fts?keyword=${keyword}`);

  return resp.data || [];
};

export const searchNFTs = async (keyword: string) => {
  if (!keyword || keyword.trim().length < 2) return [];

  const resp = await fetcher<SearchNFTRes>(
    `/v3/search/nfts?keyword=${keyword}`,
  );

  return resp.data || [];
};

export const searchKeys = async (keyword: string) => {
  if (!keyword || keyword.trim().length < 2) return [];

  const resp = await fetcher<SearchKeyRes>(
    `/v3/search/keys?keyword=${keyword}`,
  );

  return resp.data || [];
};

export const searchReceipts = async (keyword: string) => {
  if (!keyword || keyword.trim().length < 2) return [];

  const resp = await fetcher<SearchReceiptRes>(
    `/v3/search/receipts?keyword=${keyword}`,
  );

  return resp.data || [];
};
