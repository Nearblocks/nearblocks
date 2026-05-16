import { cache } from 'react';

import { MTTxnCount, MTTxnCountRes, MTTxnsRes } from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

const CONTRACT = 'intents.near';

export const fetchNearIntentsTxns = cache(
  async (params: SearchParams): Promise<MTTxnsRes> => {
    const keys = ['limit', 'before_ts', 'next', 'prev'] as const;
    const queryParams = safeParams(params, keys);

    return fetcher<MTTxnsRes>(
      `/v3/mts/${CONTRACT}/txns?${queryParams.toString()}`,
    );
  },
);

export const fetchNearIntentsTxnCount = cache(
  async (params: SearchParams): Promise<MTTxnCount | null> => {
    const keys = ['before_ts'] as const;
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTTxnCountRes>(
      `/v3/mts/${CONTRACT}/txns/count?${queryParams.toString()}`,
    );
    return resp.data;
  },
);
