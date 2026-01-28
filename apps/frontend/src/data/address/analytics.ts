import {
  AccountBalanceStats,
  AccountBalanceStatsRes,
  AccountFTStats,
  AccountFTStatsRes,
  AccountNearStats,
  AccountNearStatsRes,
  AccountStatsOverview,
  AccountStatsOverviewRes,
  AccountTxnStats,
  AccountTxnStatsRes,
} from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchStatsOverview = async (
  account: string,
): Promise<AccountStatsOverview | null> => {
  const resp = await fetcher<AccountStatsOverviewRes>(
    `/v3/accounts/${account}/stats`,
  );
  return resp.data;
};

export const fetchTxnsHeatmap = async (
  account: string,
): Promise<AccountTxnStats[] | null> => {
  const resp = await fetcher<AccountTxnStatsRes>(
    `/v3/accounts/${account}/stats/heatmap`,
  );
  return resp.data;
};

export const fetchTxnStats = async (
  account: string,
): Promise<AccountTxnStats[] | null> => {
  const resp = await fetcher<AccountTxnStatsRes>(
    `/v3/accounts/${account}/stats/txns`,
  );
  return resp.data;
};

export const fetchBalanceStats = async (
  account: string,
): Promise<AccountBalanceStats[] | null> => {
  const resp = await fetcher<AccountBalanceStatsRes>(
    `/v3/accounts/${account}/stats/balance`,
  );
  return resp.data;
};

export const fetchNearStats = async (
  account: string,
): Promise<AccountNearStats[] | null> => {
  const resp = await fetcher<AccountNearStatsRes>(
    `/v3/accounts/${account}/stats/near`,
  );
  return resp.data;
};

export const fetchFTStats = async (
  account: string,
): Promise<AccountFTStats[] | null> => {
  const resp = await fetcher<AccountFTStatsRes>(
    `/v3/accounts/${account}/stats/fts`,
  );
  return resp.data;
};
