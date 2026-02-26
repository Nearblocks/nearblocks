import { cache } from 'react';

import {
  FTContractHolderCountRes,
  FTContractHoldersReq,
  FTContractHoldersRes,
  FTContractRes,
  FTContractTxnCountReq,
  FTContractTxnCountRes,
  FTContractTxnsReq,
  FTContractTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchFTContract = cache(
  async (contract: string): Promise<FTContractRes> => {
    const resp = await fetcher<FTContractRes>(`/v3/fts/${contract}`);
    return resp;
  },
);

export const fetchFTContractTxns = cache(
  async (
    contract: string,
    params: SearchParams,
  ): Promise<FTContractTxnsRes> => {
    const keys: (keyof FTContractTxnsReq)[] = [
      'affected',
      'before_ts',
      'limit',
      'next',
      'prev',
    ];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<FTContractTxnsRes>(
      `/v3/fts/${contract}/txns?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchFTContractTxnCount = cache(
  async (
    contract: string,
    params: SearchParams,
  ): Promise<FTContractTxnCountRes> => {
    const keys: (keyof FTContractTxnCountReq)[] = ['affected', 'before_ts'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<FTContractTxnCountRes>(
      `/v3/fts/${contract}/txns/count?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchFTContractHolders = cache(
  async (
    contract: string,
    params: SearchParams,
  ): Promise<FTContractHoldersRes> => {
    const keys: (keyof FTContractHoldersReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<FTContractHoldersRes>(
      `/v3/fts/${contract}/holders?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchFTContractHolderCount = cache(
  async (contract: string): Promise<FTContractHolderCountRes> => {
    const resp = await fetcher<FTContractHolderCountRes>(
      `/v3/fts/${contract}/holders/count`,
    );
    return resp;
  },
);
