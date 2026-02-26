import { cache } from 'react';

import {
  NFTCountReq,
  NFTCountRes,
  NFTListReq,
  NFTListRes,
  NFTTxnCountReq,
  NFTTxnCountRes,
  NFTTxnsReq,
  NFTTxnsRes,
} from 'nb-schemas';

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

export const fetchNFTTxns = cache(
  async (params: SearchParams): Promise<NFTTxnsRes> => {
    const keys: (keyof NFTTxnsReq)[] = ['limit', 'next', 'prev', 'before_ts'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<NFTTxnsRes>(
      `/v3/nfts/txns?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchNFTTxnCount = cache(
  async (params: SearchParams): Promise<NFTTxnCountRes> => {
    const keys: (keyof NFTTxnCountReq)[] = ['before_ts'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<NFTTxnCountRes>(
      `/v3/nfts/txns/count?${queryParams.toString()}`,
    );
    return resp;
  },
);
