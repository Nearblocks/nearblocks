import {
  AccountReceiptCountReq,
  AccountReceiptCountRes,
  AccountReceiptsReq,
  AccountReceiptsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchReceipts = async (account: string, params: SearchParams) => {
  const keys: (keyof AccountReceiptsReq)[] = [
    'limit',
    'receiver',
    'predecessor',
    'method',
    'next',
    'prev',
  ];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountReceiptsRes>(
    `/v3/accounts/${account}/receipts?${queryParams.toString()}`,
  );
  return resp;
};

export const fetchReceiptCount = async (
  account: string,
  params: SearchParams,
) => {
  const keys: (keyof AccountReceiptCountReq)[] = [
    'predecessor',
    'receiver',
    'method',
  ];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<AccountReceiptCountRes>(
    `/v3/accounts/${account}/receipts/count?${queryParams.toString()}`,
  );
  return resp.data;
};
