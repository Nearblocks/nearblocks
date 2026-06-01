import { cache } from 'react';

import {
  FTContractStatsAccountTransfersReq,
  FTContractStatsAccountTransfersRes,
  FTContractStatsHeatmapRes,
  FTContractStatsOverviewRes,
  FTContractStatsTransfersReq,
  FTContractStatsTransfersRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchFTContractStatsOverview = cache(
  async (contract: string): Promise<FTContractStatsOverviewRes> => {
    const resp = await fetcher<FTContractStatsOverviewRes>(
      `/v3/fts/${contract}/stats/overview`,
    );
    return resp;
  },
);

export const fetchFTContractStatsHeatmap = cache(
  async (contract: string): Promise<FTContractStatsHeatmapRes> => {
    const resp = await fetcher<FTContractStatsHeatmapRes>(
      `/v3/fts/${contract}/stats/heatmap`,
    );
    return resp;
  },
);

export const fetchFTContractStatsTransfers = cache(
  async (
    contract: string,
    params: SearchParams,
  ): Promise<FTContractStatsTransfersRes> => {
    const keys: (keyof FTContractStatsTransfersReq)[] = ['limit'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<FTContractStatsTransfersRes>(
      `/v3/fts/${contract}/stats/transfers?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchFTContractStatsAccountTransfers = cache(
  async (
    contract: string,
    account: string,
    params: SearchParams,
  ): Promise<FTContractStatsAccountTransfersRes> => {
    const keys: (keyof FTContractStatsAccountTransfersReq)[] = ['limit'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<FTContractStatsAccountTransfersRes>(
      `/v3/fts/${contract}/stats/${account}/transfers?${queryParams.toString()}`,
    );
    return resp;
  },
);
