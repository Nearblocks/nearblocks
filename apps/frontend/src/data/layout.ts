import { Stats, StatsRes } from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchStats = async () => {
  const resp = await fetcher<StatsRes>('/v3/stats');
  return resp.data as Stats;
};
