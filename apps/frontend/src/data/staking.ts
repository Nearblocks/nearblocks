import { cache } from 'react';

import {
  StakingTxnCount,
  StakingTxnCountReq,
  StakingTxnCountRes,
  StakingTxnsReq,
  StakingTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchStaking = cache(
  async (params: SearchParams): Promise<StakingTxnsRes> => {
    const keys: (keyof StakingTxnsReq)[] = [
      'limit',
      'before_ts',
      'next',
      'prev',
    ];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<StakingTxnsRes>(
      `/v3/staking-txns?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchStakingCount = cache(
  async (params: SearchParams): Promise<null | StakingTxnCount> => {
    const keys: (keyof StakingTxnCountReq)[] = ['before_ts'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<StakingTxnCountRes>(
      `/v3/staking-txns/count?${queryParams.toString()}`,
    );
    return resp.data;
  },
);
