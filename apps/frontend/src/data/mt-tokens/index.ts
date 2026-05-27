import { cache } from 'react';

import {
  MTListCountReq,
  MTListCountRes,
  MTListReq,
  MTListRes,
  MTTxnCount,
  MTTxnCountReq,
  MTTxnCountRes,
  MTTxnsReq,
  MTTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchMTList = cache(
  async (params: SearchParams): Promise<MTListRes> => {
    const keys: (keyof MTListReq)[] = [
      'limit',
      'next',
      'order',
      'prev',
      'search',
      'sort',
    ];
    const queryParams = safeParams(params, keys);
    return fetcher<MTListRes>(`/v3/mts?${queryParams.toString()}`);
  },
);

export const fetchMTListCount = cache(
  async (params: SearchParams): Promise<MTListCountRes> => {
    const keys: (keyof MTListCountReq)[] = ['search'];
    const queryParams = safeParams(params, keys);
    return fetcher<MTListCountRes>(`/v3/mts/count?${queryParams.toString()}`);
  },
);

export const fetchMTTxns = cache(
  async (params: SearchParams): Promise<MTTxnsRes> => {
    const keys: (keyof MTTxnsReq)[] = ['limit', 'before_ts', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTTxnsRes>(
      `/v3/mts/txns?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchMTTxnCount = cache(
  async (params: SearchParams): Promise<MTTxnCount | null> => {
    const keys: (keyof MTTxnCountReq)[] = ['before_ts'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTTxnCountRes>(
      `/v3/mts/txns/count?${queryParams.toString()}`,
    );
    return resp.data;
  },
);
