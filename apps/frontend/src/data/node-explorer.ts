import { cache } from 'react';

import type { ValidatorEpochData, ValidatorTelemetry } from 'nb-types';

import { fetcher, safeParams } from '@/lib/fetcher';
import type { SearchParams } from '@/types/types';

export type ValidatorsRes = {
  currentValidators: number;
  elapsedTimeData: number;
  epochProgressData: number;
  epochStatsCheck: string;
  lastEpochApy: string;
  total: number;
  totalSeconds: number;
  totalStake: string;
  validatorFullData: ValidatorEpochData[];
  validatorTelemetry: Record<string, ValidatorTelemetry>;
};

export const fetchValidators = cache(
  async (params: SearchParams): Promise<ValidatorsRes> => {
    const keys: (keyof SearchParams)[] = ['page', 'search'];
    const queryParams = safeParams(params, keys);

    return fetcher<ValidatorsRes>(`/v1/validators?${queryParams.toString()}`);
  },
);
