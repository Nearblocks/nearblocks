import { cache } from 'react';

import {
  MCMpcParameters,
  MCMpcParametersRes,
  SignerStats,
  SignerStatsRes,
  SignerTotalStats,
  SignerTotalStatsRes,
} from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchMpcs = cache(async (): Promise<MCMpcParameters | null> => {
  const resp = await fetcher<MCMpcParametersRes>('/v3/multichain/mpcs');
  return resp.data;
});

export const fetchSignerStats = cache(
  async (limit?: number): Promise<null | SignerStats[]> => {
    const url = limit ? `/v3/signer-stats?limit=${limit}` : '/v3/signer-stats';
    const resp = await fetcher<SignerStatsRes>(url);
    return resp.data;
  },
);

export const fetchSignerTotalStats = cache(
  async (): Promise<null | SignerTotalStats> => {
    const resp = await fetcher<SignerTotalStatsRes>('/v3/signer-stats/total');
    return resp.data;
  },
);
