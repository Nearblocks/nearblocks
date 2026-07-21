import { cache } from 'react';

import {
  IntentsAssetPoint,
  IntentsBlockchainPoint,
  IntentsOverview,
  IntentsStatsAssetsRes,
  IntentsStatsBlockchainsRes,
  IntentsStatsOverviewRes,
  MTTxnCount,
  MTTxnCountRes,
  MTTxnsRes,
} from 'nb-schemas';

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

export const fetchIntentsOverview = cache(
  async (): Promise<IntentsOverview | null> => {
    const resp = await fetcher<IntentsStatsOverviewRes>(
      '/v3/intents/stats/overview',
    );
    return resp.data;
  },
);

export const fetchIntentsAssetStats = cache(
  async (limit?: number): Promise<IntentsAssetPoint[] | null> => {
    const url = limit
      ? `/v3/intents/stats/assets?limit=${limit}`
      : '/v3/intents/stats/assets';
    const resp = await fetcher<IntentsStatsAssetsRes>(url);
    return resp.data;
  },
);

export const fetchIntentsBlockchainStats = cache(
  async (limit?: number): Promise<IntentsBlockchainPoint[] | null> => {
    const url = limit
      ? `/v3/intents/stats/blockchains?limit=${limit}`
      : '/v3/intents/stats/blockchains';
    const resp = await fetcher<IntentsStatsBlockchainsRes>(url);
    return resp.data;
  },
);
