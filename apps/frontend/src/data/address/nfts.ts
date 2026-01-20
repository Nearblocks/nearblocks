import {
  AccountNFTTxnCount,
  AccountNFTTxnCountReq,
  AccountNFTTxnCountRes,
  AccountNFTTxnsReq,
  AccountNFTTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchNFTTxns = async (
  account: string,
  params: SearchParams,
): Promise<AccountNFTTxnsRes> => {
  const keys: (keyof AccountNFTTxnsReq)[] = [
    'limit',
    'contract',
    'involved',
    'cause',
    'token',
    'next',
    'prev',
  ];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountNFTTxnsRes>(
    `/v3/accounts/${account}/nft-txns?${queryParams.toString()}`,
  );
  return resp;
};

export const fetchNFTTxnCount = async (
  account: string,
  params: SearchParams,
): Promise<AccountNFTTxnCount | null> => {
  const keys: (keyof AccountNFTTxnCountReq)[] = [
    'contract',
    'involved',
    'cause',
    'token',
  ];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountNFTTxnCountRes>(
    `/v3/accounts/${account}/nft-txns/count?${queryParams.toString()}`,
  );
  return resp.data;
};
