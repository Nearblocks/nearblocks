import { cache } from 'react';

import {
  FTCountReq,
  FTCountRes,
  FTListReq,
  FTListRes,
  FTTxnCountReq,
  FTTxnCountRes,
  FTTxnsReq,
  FTTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchTokens = cache(
  async (params: SearchParams): Promise<FTListRes> => {
    const keys: (keyof FTListReq)[] = [
      'limit',
      'order',
      'search',
      'sort',
      'next',
      'prev',
    ];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<FTListRes>(`/v3/fts?${queryParams.toString()}`);
    return resp;
  },
);

export const fetchTokenCount = cache(
  async (params: SearchParams): Promise<FTCountRes> => {
    const keys: (keyof FTCountReq)[] = ['search'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<FTCountRes>(
      `/v3/fts/count?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchFTTxns = cache(
  async (params: SearchParams): Promise<FTTxnsRes> => {
    const keys: (keyof FTTxnsReq)[] = ['limit', 'next', 'prev', 'before_ts'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<FTTxnsRes>(
      `/v3/fts/txns?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchFTTxnCount = cache(
  async (params: SearchParams): Promise<FTTxnCountRes> => {
    const keys: (keyof FTTxnCountReq)[] = ['before_ts'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<FTTxnCountRes>(
      `/v3/fts/txns/count?${queryParams.toString()}`,
    );
    return resp;
  },
);
