import { cache } from 'react';

import {
  MTContractStatsHeatmapRes,
  MTContractStatsOverviewRes,
  MTContractStatsTransfersReq,
  MTContractStatsTransfersRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { encodeToken } from '@/lib/utils';
import { SearchParams } from '@/types/types';

export const fetchMTTokenStatsOverview = cache(
  async (
    contract: string,
    token: string,
  ): Promise<MTContractStatsOverviewRes> => {
    const resp = await fetcher<MTContractStatsOverviewRes>(
      `/v3/mts/${contract}/tokens/${encodeToken(token)}/stats/overview`,
    );
    return resp;
  },
);

export const fetchMTTokenStatsHeatmap = cache(
  async (
    contract: string,
    token: string,
  ): Promise<MTContractStatsHeatmapRes> => {
    const resp = await fetcher<MTContractStatsHeatmapRes>(
      `/v3/mts/${contract}/tokens/${encodeToken(token)}/stats/heatmap`,
    );
    return resp;
  },
);

export const fetchMTTokenStatsTransfers = cache(
  async (
    contract: string,
    token: string,
    params: SearchParams,
  ): Promise<MTContractStatsTransfersRes> => {
    const keys: (keyof MTContractStatsTransfersReq)[] = ['limit'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTContractStatsTransfersRes>(
      `/v3/mts/${contract}/tokens/${encodeToken(
        token,
      )}/stats/transfers?${queryParams.toString()}`,
    );
    return resp;
  },
);
