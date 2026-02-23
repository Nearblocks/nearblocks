import { cache } from 'react';

import {
  Txn,
  TxnCount,
  TxnCountReq,
  TxnCountRes,
  TxnFT,
  TxnFTsRes,
  TxnMT,
  TxnMTsRes,
  TxnNFT,
  TxnNFTsRes,
  TxnReceipt,
  TxnReceiptsRes,
  TxnRes,
  TxnsReq,
  TxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { SearchParams } from '@/types/types';

export const fetchTxns = async (params: SearchParams): Promise<TxnsRes> => {
  const keys: (keyof TxnsReq)[] = ['limit', 'block', 'next', 'prev'];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<TxnsRes>(`/v3/txns?${queryParams.toString()}`);
  return resp;
};

export const fetchTxnCount = async (
  params: SearchParams,
): Promise<null | TxnCount> => {
  const keys: (keyof TxnCountReq)[] = ['block'];
  const queryParams = safeParams(params, keys);

  const resp = await fetcher<TxnCountRes>(
    `/v3/txns/count?${queryParams.toString()}`,
  );
  return resp.data;
};

export const fetchTxn = cache(async (txn: string): Promise<null | Txn> => {
  const resp = await fetcher<TxnRes>(`/v3/txns/${txn}`);
  return resp.data;
});

export const fetchTxnReceipts = cache(
  async (txn: string): Promise<null | TxnReceipt> => {
    const resp = await fetcher<TxnReceiptsRes>(`/v3/txns/${txn}/receipts`);
    return resp.data;
  },
);

export const fetchTxnFTs = cache(
  async (txn: string): Promise<null | TxnFT[]> => {
    const resp = await fetcher<TxnFTsRes>(`/v3/txns/${txn}/fts`);
    return resp.data;
  },
);

export const fetchTxnNFTs = cache(
  async (txn: string): Promise<null | TxnNFT[]> => {
    const resp = await fetcher<TxnNFTsRes>(`/v3/txns/${txn}/nfts`);
    return resp.data;
  },
);

export const fetchTxnMTs = cache(
  async (txn: string): Promise<null | TxnMT[]> => {
    const resp = await fetcher<TxnMTsRes>(`/v3/txns/${txn}/mts`);
    return resp.data;
  },
);
