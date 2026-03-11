'use client';

import { use } from 'react';

import type { BlockListItem } from 'nb-schemas';
import type { Stats } from 'nb-schemas';

import type { ValidatorsRes } from '@/data/node-explorer';
import { nearFormat } from '@/lib/format';

import { EpochInfo } from './epoch';
import { StakingOverview } from './staking';
import { ValidatorInfo } from './validator';
import { ValidatorsTable } from './validators';

type Props = {
  latestBlocksPromise?: Promise<BlockListItem[] | null>;
  loading?: boolean;
  statsPromise?: Promise<null | Stats>;
  validatorsPromise?: Promise<ValidatorsRes>;
};

export const NodeExplorer = ({
  latestBlocksPromise,
  loading,
  statsPromise,
  validatorsPromise,
}: Props) => {
  const validators =
    !loading && validatorsPromise ? use(validatorsPromise) : null;
  const stats = !loading && statsPromise ? use(statsPromise) : null;
  const latestBlocks =
    !loading && latestBlocksPromise ? use(latestBlocksPromise) : null;

  const totalSupply = stats?.total_supply
    ? nearFormat(stats.total_supply, { maximumFractionDigits: 0 })
    : null;

  const latestBlockHeight = latestBlocks?.[0]?.block_height
    ? Number(latestBlocks[0].block_height)
    : 0;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StakingOverview
          loading={loading}
          totalSupply={totalSupply}
          validators={validators}
        />
        <ValidatorInfo loading={loading} />
        <EpochInfo loading={loading} validators={validators} />
      </div>
      <ValidatorsTable
        latestBlockHeight={latestBlockHeight}
        loading={loading}
        validators={validators}
      />
    </div>
  );
};
