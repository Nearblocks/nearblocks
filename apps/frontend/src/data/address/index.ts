import { cache } from 'react';

import {
  Account,
  AccountAssetFT,
  AccountAssetFTBalanceRes,
  AccountAssetFTsRes,
  AccountAssetMTFT,
  AccountAssetMTFTsRes,
  AccountBalance,
  AccountBalanceRes,
  AccountRes,
} from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchAccount = cache(
  async (account: string): Promise<Account | null> => {
    const resp = await fetcher<AccountRes>(`/v3/accounts/${account}`);
    return resp.data;
  },
);

export const fetchBalance = cache(
  async (account: string): Promise<AccountBalance | null> => {
    const resp = await fetcher<AccountBalanceRes>(
      `/v3/accounts/${account}/balance`,
    );
    return resp.data;
  },
);

export const fetchTokens = cache(
  async (account: string): Promise<AccountAssetFT[] | null> => {
    const resp = await fetcher<AccountAssetFTsRes>(
      `/v3/accounts/${account}/assets/fts?limit=250`,
    );
    return resp.data;
  },
);

export const fetchMTTokens = cache(
  async (account: string): Promise<AccountAssetMTFT[] | null> => {
    const resp = await fetcher<AccountAssetMTFTsRes>(
      `/v3/accounts/${account}/assets/mts/fts?limit=250`,
    );
    return resp.data;
  },
);

export const fetchFTBalance = cache(
  async (account: string, contract: string): Promise<null | string> => {
    try {
      const resp = await fetcher<AccountAssetFTBalanceRes>(
        `/v3/accounts/${account}/assets/fts/${contract}`,
      );
      return resp.data?.amount ?? null;
    } catch {
      return null;
    }
  },
);
