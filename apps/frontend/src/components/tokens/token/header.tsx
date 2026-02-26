'use client';

import { use } from 'react';

import { FTContractRes } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { TokenImage } from '@/components/token';
import { Truncate, TruncateText } from '@/components/truncate';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  contractPromise?: Promise<FTContractRes>;
  loading?: boolean;
  token: string;
};

export const TokenHeader = ({ contractPromise, loading, token }: Props) => {
  const result = !loading && contractPromise ? use(contractPromise) : null;
  const contract = result?.data ?? null;

  return (
    <SkeletonSlot
      fallback={
        <span className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="w-32" />
        </span>
      }
      loading={loading || !contract}
    >
      {() => (
        <span className="flex items-center gap-2">
          <TokenImage
            alt={contract?.name ?? token}
            className="size-6 rounded-full border"
            src={contract?.icon ?? ''}
          />
          <Truncate className="flex items-center gap-2">
            <TruncateText
              className="text-foreground max-w-60"
              text={contract?.name ?? token}
            />
          </Truncate>
          <Truncate>
            (
            <TruncateText
              className="text-foreground max-w-30"
              text={contract?.symbol ?? token}
            />
            )
          </Truncate>
        </span>
      )}
    </SkeletonSlot>
  );
};
