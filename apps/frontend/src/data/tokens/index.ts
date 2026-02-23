import { cache } from 'react';

import { FTCountReq, FTCountRes, FTListReq, FTListRes } from 'nb-schemas';

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
