import { AccountKeyCountRes, AccountKeysReq, AccountKeysRes } from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchKeys = async (account: string, params: SearchParams) => {
  const keys: (keyof AccountKeysReq)[] = ['limit', 'next', 'prev'];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountKeysRes>(
    `/v3/accounts/${account}/keys?${queryParams.toString()}`,
  );
  return resp;
};

export const fetchKeyCount = async (account: string) => {
  const resp = await fetcher<AccountKeyCountRes>(
    `/v3/accounts/${account}/keys/count`,
  );
  return resp.data;
};
