import {
  AccountAssetFTCount,
  AccountAssetFTCountRes,
  AccountAssetFTsReq,
  AccountAssetFTsRes,
  AccountAssetNFTCount,
  AccountAssetNFTCountRes,
  AccountAssetNFTsReq,
  AccountAssetNFTsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchFTAssets = async (
  account: string,
  params: SearchParams,
): Promise<AccountAssetFTsRes> => {
  const keys: (keyof AccountAssetFTsReq)[] = ['limit', 'next', 'prev'];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountAssetFTsRes>(
    `/v3/accounts/${account}/assets/fts?${queryParams.toString()}`,
  );
  return resp;
};

export const fetchFTAssetCount = async (
  account: string,
): Promise<AccountAssetFTCount | null> => {
  const resp = await fetcher<AccountAssetFTCountRes>(
    `/v3/accounts/${account}/assets/fts/count`,
  );
  return resp.data;
};

export const fetchNFTAssets = async (
  account: string,
  params: SearchParams,
): Promise<AccountAssetNFTsRes> => {
  const keys: (keyof AccountAssetNFTsReq)[] = ['limit', 'next', 'prev'];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountAssetNFTsRes>(
    `/v3/accounts/${account}/assets/nfts?${queryParams.toString()}`,
  );
  return resp;
};

export const fetchNFTAssetCount = async (
  account: string,
): Promise<AccountAssetNFTCount | null> => {
  const resp = await fetcher<AccountAssetNFTCountRes>(
    `/v3/accounts/${account}/assets/nfts/count`,
  );
  return resp.data;
};
