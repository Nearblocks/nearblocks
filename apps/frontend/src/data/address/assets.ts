import { cache } from 'react';

import {
  AccountAssetFTCount,
  AccountAssetFTCountRes,
  AccountAssetFTsReq,
  AccountAssetFTsRes,
  AccountAssetMTFTCount,
  AccountAssetMTFTCountRes,
  AccountAssetMTFTsReq,
  AccountAssetMTFTsRes,
  AccountAssetMTNFTCount,
  AccountAssetMTNFTCountRes,
  AccountAssetMTNFTsReq,
  AccountAssetMTNFTsRes,
  AccountAssetNFTCount,
  AccountAssetNFTCountRes,
  AccountAssetNFTsReq,
  AccountAssetNFTsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchFTAssets = cache(
  async (
    account: string,
    params: SearchParams,
  ): Promise<AccountAssetFTsRes> => {
    const keys: (keyof AccountAssetFTsReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<AccountAssetFTsRes>(
      `/v3/accounts/${account}/assets/fts?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchFTAssetCount = cache(
  async (account: string): Promise<AccountAssetFTCount | null> => {
    const resp = await fetcher<AccountAssetFTCountRes>(
      `/v3/accounts/${account}/assets/fts/count`,
    );
    return resp.data;
  },
);

export const fetchNFTAssets = cache(
  async (
    account: string,
    params: SearchParams,
  ): Promise<AccountAssetNFTsRes> => {
    const keys: (keyof AccountAssetNFTsReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<AccountAssetNFTsRes>(
      `/v3/accounts/${account}/assets/nfts?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchNFTAssetCount = cache(
  async (account: string): Promise<AccountAssetNFTCount | null> => {
    const resp = await fetcher<AccountAssetNFTCountRes>(
      `/v3/accounts/${account}/assets/nfts/count`,
    );
    return resp.data;
  },
);

export const fetchMTFTAssets = cache(
  async (
    account: string,
    params: SearchParams,
  ): Promise<AccountAssetMTFTsRes> => {
    const keys: (keyof AccountAssetMTFTsReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<AccountAssetMTFTsRes>(
      `/v3/accounts/${account}/assets/mts/fts?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchMTFTAssetCount = cache(
  async (account: string): Promise<AccountAssetMTFTCount | null> => {
    const resp = await fetcher<AccountAssetMTFTCountRes>(
      `/v3/accounts/${account}/assets/mts/fts/count`,
    );
    return resp.data;
  },
);

export const fetchMTNFTAssets = cache(
  async (
    account: string,
    params: SearchParams,
  ): Promise<AccountAssetMTNFTsRes> => {
    const keys: (keyof AccountAssetMTNFTsReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<AccountAssetMTNFTsRes>(
      `/v3/accounts/${account}/assets/mts/nfts?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchMTNFTAssetCount = cache(
  async (account: string): Promise<AccountAssetMTNFTCount | null> => {
    const resp = await fetcher<AccountAssetMTNFTCountRes>(
      `/v3/accounts/${account}/assets/mts/nfts/count`,
    );
    return resp.data;
  },
);
