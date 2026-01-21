import {
  AccountMTTxnCount,
  AccountMTTxnCountReq,
  AccountMTTxnCountRes,
  AccountMTTxnsReq,
  AccountMTTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchMTTxns = async (
  account: string,
  params: SearchParams,
): Promise<AccountMTTxnsRes> => {
  const keys: (keyof AccountMTTxnsReq)[] = [
    'limit',
    'contract',
    'involved',
    'cause',
    'token',
    'next',
    'prev',
  ];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountMTTxnsRes>(
    `/v3/accounts/${account}/mt-txns?${queryParams.toString()}`,
  );
  return resp;
};

export const fetchMTTxnCount = async (
  account: string,
  params: SearchParams,
): Promise<AccountMTTxnCount | null> => {
  const keys: (keyof AccountMTTxnCountReq)[] = [
    'contract',
    'involved',
    'cause',
    'token',
  ];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountMTTxnCountRes>(
    `/v3/accounts/${account}/mt-txns/count?${queryParams.toString()}`,
  );
  return resp.data;
};
