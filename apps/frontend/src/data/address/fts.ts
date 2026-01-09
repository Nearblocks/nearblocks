import {
  AccountFTTxnCountReq,
  AccountFTTxnCountRes,
  AccountFTTxnsReq,
  AccountFTTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchFTTxns = async (account: string, params: SearchParams) => {
  const keys: (keyof AccountFTTxnsReq)[] = [
    'limit',
    'contract',
    'involved',
    'cause',
    'next',
    'prev',
  ];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountFTTxnsRes>(
    `/v3/accounts/${account}/ft-txns?${queryParams.toString()}`,
  );
  return resp;
};

export const fetchFTTxnCount = async (
  account: string,
  params: SearchParams,
) => {
  const keys: (keyof AccountFTTxnCountReq)[] = [
    'contract',
    'involved',
    'cause',
  ];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountFTTxnCountRes>(
    `/v3/accounts/${account}/ft-txns/count?${queryParams.toString()}`,
  );
  return resp.data;
};
