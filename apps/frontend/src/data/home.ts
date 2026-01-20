import {
  Block,
  BlocksRes,
  DailyStats,
  DailyStatsRes,
  Txn,
  TxnsRes,
} from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchBlocks = async (): Promise<Block[] | null> => {
  const resp = await fetcher<BlocksRes>('/v3/blocks/latest');
  return resp.data;
};

export const fetchTxns = async (): Promise<null | Txn[]> => {
  const resp = await fetcher<TxnsRes>('/v3/txns/latest');
  return resp.data;
};

export const fetchDailyStats = async (): Promise<DailyStats[] | null> => {
  const resp = await fetcher<DailyStatsRes>('/v3/daily-stats?limit=14');
  return resp.data;
};
