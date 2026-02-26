import { cache } from 'react';

import {
  NFTContractHolderCountRes,
  NFTContractHoldersReq,
  NFTContractHoldersRes,
  NFTContractRes,
  NFTContractTxnCountReq,
  NFTContractTxnCountRes,
  NFTContractTxnsReq,
  NFTContractTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchNFTContract = cache(
  async (contract: string): Promise<NFTContractRes> => {
    const resp = await fetcher<NFTContractRes>(`/v3/nfts/${contract}`);
    return resp;
  },
);

export const fetchNFTContractTxns = cache(
  async (
    contract: string,
    params: SearchParams,
  ): Promise<NFTContractTxnsRes> => {
    const keys: (keyof NFTContractTxnsReq)[] = [
      'affected',
      'before_ts',
      'limit',
      'next',
      'prev',
    ];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<NFTContractTxnsRes>(
      `/v3/nfts/${contract}/txns?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchNFTContractTxnCount = cache(
  async (
    contract: string,
    params: SearchParams,
  ): Promise<NFTContractTxnCountRes> => {
    const keys: (keyof NFTContractTxnCountReq)[] = ['affected', 'before_ts'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<NFTContractTxnCountRes>(
      `/v3/nfts/${contract}/txns/count?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchNFTContractHolders = cache(
  async (
    contract: string,
    params: SearchParams,
  ): Promise<NFTContractHoldersRes> => {
    const keys: (keyof NFTContractHoldersReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<NFTContractHoldersRes>(
      `/v3/nfts/${contract}/holders?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchNFTContractHolderCount = cache(
  async (contract: string): Promise<NFTContractHolderCountRes> => {
    const resp = await fetcher<NFTContractHolderCountRes>(
      `/v3/nfts/${contract}/holders/count`,
    );
    return resp;
  },
);
