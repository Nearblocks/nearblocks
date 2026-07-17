import { cache } from 'react';

import {
  AccountSubAccountCount,
  AccountSubAccountCountRes,
  AccountSubAccountsReq,
  AccountSubAccountsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchSubAccounts = cache(
  async (
    account: string,
    params: SearchParams,
  ): Promise<AccountSubAccountsRes> => {
    const keys: (keyof AccountSubAccountsReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<AccountSubAccountsRes>(
      `/v3/accounts/${account}/subaccounts?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchSubAccountCount = cache(
  async (account: string): Promise<AccountSubAccountCount | null> => {
    const resp = await fetcher<AccountSubAccountCountRes>(
      `/v3/accounts/${account}/subaccounts/count`,
    );
    return resp.data;
  },
);
