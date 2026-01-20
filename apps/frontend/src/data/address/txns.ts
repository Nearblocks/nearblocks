import {
  AccountTxnCount,
  AccountTxnCountReq,
  AccountTxnCountRes,
  AccountTxnsReq,
  AccountTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchTxns = async (
  account: string,
  params: SearchParams,
): Promise<AccountTxnsRes> => {
  const keys: (keyof AccountTxnsReq)[] = [
    'limit',
    'receiver',
    'signer',
    'next',
    'prev',
  ];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountTxnsRes>(
    `/v3/accounts/${account}/txns?${queryParams.toString()}`,
  );
  return resp;
};

export const fetchTxnCount = async (
  account: string,
  params: SearchParams,
): Promise<AccountTxnCount | null> => {
  const keys: (keyof AccountTxnCountReq)[] = ['receiver', 'signer'];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountTxnCountRes>(
    `/v3/accounts/${account}/txns/count?${queryParams.toString()}`,
  );
  return resp.data;
};
