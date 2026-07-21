import { cache } from 'react';

import {
  AddressStats,
  AddressStatsRes,
  DailyBlockStats,
  DailyBlockStatsRes,
  DailyTxnStats,
  DailyTxnStatsRes,
  IntentsMetricPoint,
  IntentsSwapStatsRes,
  IntentsVolumeStatsRes,
  PriceStats,
  PriceStatsRes,
  TpsStats,
  TpsStatsRes,
} from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchBlockStats = cache(
  async (limit?: number): Promise<DailyBlockStats[] | null> => {
    const url = limit ? `/v3/block-stats?limit=${limit}` : '/v3/block-stats';
    const resp = await fetcher<DailyBlockStatsRes>(url);
    return resp.data;
  },
);

export const fetchTxnStats = cache(
  async (limit?: number): Promise<DailyTxnStats[] | null> => {
    const url = limit ? `/v3/txn-stats?limit=${limit}` : '/v3/txn-stats';
    const resp = await fetcher<DailyTxnStatsRes>(url);
    return resp.data;
  },
);

export const fetchAddressStats = cache(
  async (limit?: number): Promise<AddressStats[] | null> => {
    const url = limit
      ? `/v3/address-stats?limit=${limit}`
      : '/v3/address-stats';
    const resp = await fetcher<AddressStatsRes>(url);
    return resp.data;
  },
);

export const fetchPriceStats = cache(
  async (limit?: number): Promise<null | PriceStats[]> => {
    const url = limit ? `/v3/price-stats?limit=${limit}` : '/v3/price-stats';
    const resp = await fetcher<PriceStatsRes>(url);
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

export const fetchIntentsVolumeStats = cache(
  async (limit?: number): Promise<IntentsMetricPoint[] | null> => {
    const url = limit
      ? `/v3/intents/volume-stats?limit=${limit}`
      : '/v3/intents/volume-stats';
    const resp = await fetcher<IntentsVolumeStatsRes>(url);
    return resp.data;
  },
);

export const fetchIntentsSwapStats = cache(
  async (limit?: number): Promise<IntentsMetricPoint[] | null> => {
    const url = limit
      ? `/v3/intents/swap-stats?limit=${limit}`
      : '/v3/intents/swap-stats';
    const resp = await fetcher<IntentsSwapStatsRes>(url);
    return resp.data;
  },
);
