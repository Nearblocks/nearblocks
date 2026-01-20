import { cache } from 'react';

import { Stats, StatsRes } from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchStats = cache(async (): Promise<null | Stats> => {
  const resp = await fetcher<StatsRes>('/v3/stats');
  return resp.data;
});
