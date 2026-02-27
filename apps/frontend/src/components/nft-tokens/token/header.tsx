'use client';

import { use } from 'react';

import { NFTContractRes } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { TokenImage } from '@/components/token';
import { Truncate, TruncateText } from '@/components/truncate';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  cid: string;
  contractPromise?: Promise<NFTContractRes>;
  loading?: boolean;
};

export const NftTokenHeader = ({ cid, contractPromise, loading }: Props) => {
  const contract = !loading && contractPromise ? use(contractPromise) : null;

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
            alt={contract?.data?.name ?? cid}
            className="size-6 rounded-full border"
            src={contract?.data?.icon ?? ''}
          />
          <Truncate className="flex items-center gap-2">
            <TruncateText
              className="text-foreground max-w-60"
              text={contract?.data?.name ?? cid}
            />
          </Truncate>
          <Truncate>
            (
            <TruncateText
              className="text-foreground max-w-30"
              text={contract?.data?.symbol ?? cid}
            />
            )
          </Truncate>
        </span>
      )}
    </SkeletonSlot>
  );
};
