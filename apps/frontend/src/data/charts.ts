import { cache } from 'react';

import { DailyStats, DailyStatsRes, TpsStats, TpsStatsRes } from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchDailyStats = cache(
  async (limit?: number): Promise<DailyStats[] | null> => {
    const url = limit ? `/v3/daily-stats?limit=${limit}` : '/v3/daily-stats';
    const resp = await fetcher<DailyStatsRes>(url);
    return resp.data;
  },
);

export const fetchTpsStats = cache(
  async (limit?: number): Promise<null | TpsStats[]> => {
    const url = limit ? `/v3/tps-stats?limit=${limit}` : '/v3/tps-stats';
    const resp = await fetcher<TpsStatsRes>(url);
    return resp.data;
  },
);
