import { cache } from 'react';

import {
  Account,
  AccountAssetFT,
  AccountAssetFTsRes,
  AccountBalance,
  AccountBalanceRes,
  AccountRes,
} from 'nb-schemas';

import { getServerConfig } from '@/lib/config';
import { fetcher } from '@/lib/fetcher';
import { TokenCache, TokensCacheRes } from '@/types/types';

export const fetchAccount = cache(
  async (account: string): Promise<Account | null> => {
    const resp = await fetcher<AccountRes>(`/v3/accounts/${account}`);
    return resp.data;
  },
);

export const fetchBalance = async (
  account: string,
): Promise<AccountBalance | null> => {
  const resp = await fetcher<AccountBalanceRes>(
    `/v3/accounts/${account}/balance`,
  );
  return resp.data;
};

export const fetchTokens = async (
  account: string,
): Promise<AccountAssetFT[] | null> => {
  const resp = await fetcher<AccountAssetFTsRes>(
    `/v3/accounts/${account}/assets/fts?limit=100`,
  );
  return resp.data;
};

export const fetchTokenCache = async (
  account: string,
): Promise<null | TokenCache[]> => {
  try {
    const config = getServerConfig();
    const apiKey = config.NEXT_PUBLIC_FASTNEAR_RPC_KEY;

    const res = await fetch(
      `https://api.fastnear.com/v1/account/${account}/ft?apiKey=${apiKey}`,
    );

    if (!res.ok) return null;

    const resp = (await res.json()) as TokensCacheRes;
    return resp.tokens;
  } catch {
    return null;
  }
};
