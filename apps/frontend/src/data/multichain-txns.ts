import { cache } from 'react';

import { MCTxnsReq, MCTxnsRes } from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchMCTxns = cache(
  async (params: SearchParams): Promise<MCTxnsRes> => {
    const keys: (keyof MCTxnsReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MCTxnsRes>(
      `/v3/multichain/signatures?${queryParams.toString()}`,
    );
    return resp;
  },
);
