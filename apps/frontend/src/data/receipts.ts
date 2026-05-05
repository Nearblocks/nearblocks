import { cache } from 'react';

import {
  ReceiptCount,
  ReceiptCountReq,
  ReceiptCountRes,
  ReceiptsReq,
  ReceiptsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchReceipts = cache(
  async (params: SearchParams): Promise<ReceiptsRes> => {
    const keys: (keyof ReceiptsReq)[] = [
      'limit',
      'block',
      'before_ts',
      'next',
      'prev',
    ];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<ReceiptsRes>(
      `/v3/receipts?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchReceiptCount = cache(
  async (params: SearchParams): Promise<null | ReceiptCount> => {
    const keys: (keyof ReceiptCountReq)[] = ['block', 'before_ts'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<ReceiptCountRes>(
      `/v3/receipts/count?${queryParams.toString()}`,
    );
    return resp.data;
  },
);
