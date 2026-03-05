import { cache } from 'react';

import { DailyStats, DailyStatsRes } from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchDailyStats = cache(
  async (limit?: number): Promise<DailyStats[] | null> => {
    const url = limit ? `/v3/daily-stats?limit=${limit}` : '/v3/daily-stats';
    const resp = await fetcher<DailyStatsRes>(url);
    return resp.data;
  },
);
