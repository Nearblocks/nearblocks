import {
  Block,
  BlocksRes,
  DailyStats,
  DailyStatsRes,
  Txn,
  TxnsRes,
} from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchBlocks = async () => {
  const resp = await fetcher<BlocksRes>('/v3/blocks/latest');
  return resp.data as Block[];
};

export const fetchTxns = async () => {
  const resp = await fetcher<TxnsRes>('/v3/txns/latest');
  return resp.data as Txn[];
};

export const fetchDailyStats = async () => {
  const resp = await fetcher<DailyStatsRes>('/v3/daily-stats?limit=14');
  return resp.data as DailyStats[];
};
