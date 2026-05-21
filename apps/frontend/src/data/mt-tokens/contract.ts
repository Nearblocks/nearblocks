import { cache } from 'react';

import {
  MTContractTxnCountReq,
  MTContractTxnCountRes,
  MTContractTxnsReq,
  MTContractTxnsRes,
  MTTokenCountRes,
  MTTokenHolderCountRes,
  MTTokenHoldersReq,
  MTTokenHoldersRes,
  MTTokenListReq,
  MTTokenListRes,
  MTTokenRes,
  MTTokenTxnCountReq,
  MTTokenTxnCountRes,
  MTTokenTxnsReq,
  MTTokenTxnsRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import { encodeToken } from '@/lib/utils';
import { SearchParams } from '@/types/types';

export const fetchMTContractTxns = cache(
  async (
    contract: string,
    params: SearchParams,
  ): Promise<MTContractTxnsRes> => {
    const keys: (keyof MTContractTxnsReq)[] = [
      'affected',
      'before_ts',
      'limit',
      'next',
      'prev',
      'token',
    ];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTContractTxnsRes>(
      `/v3/mts/${contract}/txns?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchMTContractTxnCount = cache(
  async (
    contract: string,
    params: SearchParams,
  ): Promise<MTContractTxnCountRes> => {
    const keys: (keyof MTContractTxnCountReq)[] = [
      'affected',
      'before_ts',
      'token',
    ];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTContractTxnCountRes>(
      `/v3/mts/${contract}/txns/count?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchMTContractTokens = cache(
  async (contract: string, params: SearchParams): Promise<MTTokenListRes> => {
    const keys: (keyof MTTokenListReq)[] = ['limit', 'next', 'prev', 'type'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTTokenListRes>(
      `/v3/mts/${contract}/tokens?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchMTContractTokenCount = cache(
  async (
    contract: string,
    params: SearchParams = {},
  ): Promise<MTTokenCountRes> => {
    const queryParams = safeParams(params, ['type']);

    const resp = await fetcher<MTTokenCountRes>(
      `/v3/mts/${contract}/tokens/count?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchMTToken = cache(
  async (contract: string, token: string): Promise<MTTokenRes> => {
    const resp = await fetcher<MTTokenRes>(
      `/v3/mts/${contract}/tokens/${encodeToken(token)}`,
    );
    return resp;
  },
);

export const fetchMTTokenTxns = cache(
  async (
    contract: string,
    token: string,
    params: SearchParams,
  ): Promise<MTTokenTxnsRes> => {
    const keys: (keyof MTTokenTxnsReq)[] = [
      'before_ts',
      'limit',
      'next',
      'prev',
    ];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTTokenTxnsRes>(
      `/v3/mts/${contract}/tokens/${encodeToken(
        token,
      )}/txns?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchMTTokenTxnCount = cache(
  async (
    contract: string,
    token: string,
    params: SearchParams,
  ): Promise<MTTokenTxnCountRes> => {
    const keys: (keyof MTTokenTxnCountReq)[] = ['before_ts'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTTokenTxnCountRes>(
      `/v3/mts/${contract}/tokens/${encodeToken(
        token,
      )}/txns/count?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchMTTokenHolders = cache(
  async (
    contract: string,
    token: string,
    params: SearchParams,
  ): Promise<MTTokenHoldersRes> => {
    const keys: (keyof MTTokenHoldersReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);

    const resp = await fetcher<MTTokenHoldersRes>(
      `/v3/mts/${contract}/tokens/${encodeToken(
        token,
      )}/holders?${queryParams.toString()}`,
    );
    return resp;
  },
);

export const fetchMTTokenHolderCount = cache(
  async (contract: string, token: string): Promise<MTTokenHolderCountRes> => {
    const resp = await fetcher<MTTokenHolderCountRes>(
      `/v3/mts/${contract}/tokens/${encodeToken(token)}/holders/count`,
    );
    return resp;
  },
);
