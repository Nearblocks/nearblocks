import { cache } from 'react';

import {
  BlockListItem,
  BlocksRes,
  DailyStats,
  DailyStatsRes,
  TxnListItem,
  TxnsRes,
} from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchBlocks = cache(async (): Promise<BlockListItem[] | null> => {
  const resp = await fetcher<BlocksRes>('/v3/blocks/latest');
  return resp.data;
});

export const fetchTxns = cache(async (): Promise<null | TxnListItem[]> => {
  const resp = await fetcher<TxnsRes>('/v3/txns/latest');
  return resp.data;
});

export const fetchDailyStats = cache(async (): Promise<DailyStats[] | null> => {
  const resp = await fetcher<DailyStatsRes>('/v3/daily-stats?limit=14');
  return resp.data;
});
