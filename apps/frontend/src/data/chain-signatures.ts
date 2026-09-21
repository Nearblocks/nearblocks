import { cache } from 'react';

import {
  MCMpcParametersRes,
  SignerStats,
  SignerStatsRes,
  SignerTotalStats,
  SignerTotalStatsRes,
  TvlStats,
  TvlStatsRes,
} from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

// Returns the full response so consumers can tell an error-shaped payload
// (throw to the retry card) apart from genuinely-empty data.
export const fetchMpcs = cache(async (): Promise<MCMpcParametersRes> => {
  const resp = await fetcher<MCMpcParametersRes>('/v3/multichain/mpcs');
  return resp;
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

export const fetchTvlStats = cache(
  async (limit?: number): Promise<null | TvlStats[]> => {
    const url = limit ? `/v3/tvl-stats?limit=${limit}` : '/v3/tvl-stats';
    const resp = await fetcher<TvlStatsRes>(url);
    return resp.data;
  },
);
