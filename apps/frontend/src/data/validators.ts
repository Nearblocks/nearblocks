import { cache } from 'react';

import type {
  Validator,
  ValidatorBlockStats,
  ValidatorBlockStatsRes,
  ValidatorChunkStats,
  ValidatorChunkStatsRes,
  ValidatorDetailRes,
  ValidatorInfoRes,
  ValidatorsListReq,
  ValidatorsListRes,
} from 'nb-schemas';

import { fetcher, safeParams } from '@/lib/fetcher';
import type { SearchParams } from '@/types/types';

export const fetchValidatorList = cache(
  async (params: SearchParams): Promise<ValidatorsListRes> => {
    const keys: (keyof ValidatorsListReq)[] = ['limit', 'next', 'prev'];
    const queryParams = safeParams(params, keys);
    return fetcher<ValidatorsListRes>(
      `/v3/validators?${queryParams.toString()}`,
    );
  },
);

export const fetchValidatorInfo = cache(async (): Promise<ValidatorInfoRes> => {
  return fetcher<ValidatorInfoRes>(`/v3/validators/info`);
});

export const fetchValidator = cache(
  async (account: string): Promise<null | Validator> => {
    const resp = await fetcher<ValidatorDetailRes>(`/v3/validators/${account}`);
    return resp.data;
  },
);

export const fetchValidatorBlockStats = cache(
  async (account: string): Promise<null | ValidatorBlockStats[]> => {
    const resp = await fetcher<ValidatorBlockStatsRes>(
      `/v3/validators/${account}/stats/blocks`,
    );
    return resp.data;
  },
);

export const fetchValidatorChunkStats = cache(
  async (account: string): Promise<null | ValidatorChunkStats[]> => {
    const resp = await fetcher<ValidatorChunkStatsRes>(
      `/v3/validators/${account}/stats/chunks`,
    );
    return resp.data;
  },
);
