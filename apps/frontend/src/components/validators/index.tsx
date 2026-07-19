'use client';

import { use } from 'react';

import type { Stats, ValidatorInfoRes, ValidatorsListRes } from 'nb-schemas';

import { nearFormat } from '@/lib/format';

import { EpochInfo } from './epoch';
import { StakingOverview } from './staking';
import { ValidatorInfo as ValidatorInfoCard } from './validator';
import { ValidatorsTable } from './validators';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<null | Stats>;
  validatorInfoPromise?: Promise<ValidatorInfoRes>;
  validatorListPromise?: Promise<ValidatorsListRes>;
};

export const Validators = ({
  loading,
  statsPromise,
  validatorInfoPromise,
  validatorListPromise,
}: Props) => {
  const list =
    !loading && validatorListPromise ? use(validatorListPromise) : null;
  const info =
    !loading && validatorInfoPromise ? use(validatorInfoPromise) : null;
  const stats = !loading && statsPromise ? use(statsPromise) : null;
  if (list?.errors?.length || info?.errors?.length) {
    throw new Error('Failed to load validators');
  }

  const totalSupply = stats?.total_supply
    ? nearFormat(stats.total_supply, { maximumFractionDigits: 0 })
    : null;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StakingOverview
          info={info?.data ?? null}
          loading={loading}
          totalSupply={totalSupply}
        />
        <ValidatorInfoCard info={info?.data ?? null} loading={loading} />
        <EpochInfo info={info?.data ?? null} loading={loading} />
      </div>
      <ValidatorsTable
        lastEpochApy={info?.data?.last_epoch_apy ?? null}
        loading={loading}
        meta={list?.meta}
        networkHolderIndex={info?.data?.network_holder_index ?? null}
        total={info?.data?.total_validators_count ?? null}
        validators={list?.data ?? null}
      />
    </div>
  );
};
