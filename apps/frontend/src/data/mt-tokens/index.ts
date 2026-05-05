import { cache } from 'react';

import {
  MTTxnCount,
  MTTxnCountReq,
  MTTxnCountRes,
  MTTxnsReq,
  MTTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchMTTxns = cache(
  async (params: SearchParams): Promise<MTTxnsRes> => {
    const keys: (keyof MTTxnsReq)[] = ['limit', 'before_ts', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTTxnsRes>(
      `/v3/mt-txns?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchMTTxnCount = cache(
  async (params: SearchParams): Promise<MTTxnCount | null> => {
    const keys: (keyof MTTxnCountReq)[] = ['before_ts'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTTxnCountRes>(
      `/v3/mt-txns/count?${queryParams.toString()}`,
    );
    return resp.data;
  },
);
