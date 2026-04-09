import { cache } from 'react';

import { MCStats, MCStatsRes, MCTxnsReq, MCTxnsRes } from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchMCStats = cache(async (): Promise<MCStats | null> => {
  const resp = await fetcher<MCStatsRes>(`/v3/multichain/signatures/stats`);
  return resp.data;
});

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
