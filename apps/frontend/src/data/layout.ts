import { cache } from 'react';

import { StatsRes } from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchStats = cache(async () => {
  const resp = await fetcher<StatsRes>('/v3/stats');
  return resp.data;
});
