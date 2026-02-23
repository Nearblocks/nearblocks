import { cache } from 'react';

import { NFTCountReq, NFTCountRes, NFTListReq, NFTListRes } from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchNFTTokens = cache(
  async (params: SearchParams): Promise<NFTListRes> => {
    const keys: (keyof NFTListReq)[] = [
      'limit',
      'order',
      'search',
      'sort',
      'next',
      'prev',
    ];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<NFTListRes>(
      `/v3/nfts?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchNFTTokenCount = cache(
  async (params: SearchParams): Promise<NFTCountRes> => {
    const keys: (keyof NFTCountReq)[] = ['search'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<NFTCountRes>(
      `/v3/nfts/count?${queryParams.toString()}`,
    );
    return resp;
  },
);
