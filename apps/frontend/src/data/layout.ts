import { cache } from 'react';

import { BlockStatus, BlockStatusRes, Stats, StatsRes } from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchStats = cache(async (): Promise<null | Stats> => {
  const resp = await fetcher<StatsRes>('/v3/stats');
  return resp.data;
});

export const fetchSyncStatus = cache(async (): Promise<BlockStatus | null> => {
  const resp = await fetcher<BlockStatusRes>('/v3/sync/status/indexer-base');
  return resp.data;
});
