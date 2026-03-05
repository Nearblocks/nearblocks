import { cache } from 'react';

import {
  AccountStakingTxnCount,
  AccountStakingTxnCountReq,
  AccountStakingTxnCountRes,
  AccountStakingTxnsReq,
  AccountStakingTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchStaking = cache(
  async (
    account: string,
    params: SearchParams,
  ): Promise<AccountStakingTxnsRes> => {
    const keys: (keyof AccountStakingTxnsReq)[] = [
      'limit',
      'next',
      'prev',
      'contract',
      'type',
    ];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<AccountStakingTxnsRes>(
      `/v3/accounts/${account}/staking-txns?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchStakingCount = cache(
  async (
    account: string,
    params: SearchParams,
  ): Promise<AccountStakingTxnCount | null> => {
    const keys: (keyof AccountStakingTxnCountReq)[] = ['contract', 'type'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<AccountStakingTxnCountRes>(
      `/v3/accounts/${account}/staking-txns/count?${queryParams.toString()}`,
    );
    return resp.data;
  },
);
