import { cache } from 'react';

import {
  AccountRpcKeyCount,
  AccountRpcKeyCountRes,
  AccountRpcKeysReq,
  AccountRpcKeysRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchRpcKeys = cache(
  async (account: string, params: SearchParams): Promise<AccountRpcKeysRes> => {
    const keys: (keyof AccountRpcKeysReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<AccountRpcKeysRes>(
      `/v3/accounts/${account}/keys/rpc?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchRpcKeyCount = cache(
  async (account: string): Promise<AccountRpcKeyCount | null> => {
    const resp = await fetcher<AccountRpcKeyCountRes>(
      `/v3/accounts/${account}/keys/rpc/count`,
    );
    return resp.data;
  },
);
