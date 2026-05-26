import { cache } from 'react';

import type {
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
