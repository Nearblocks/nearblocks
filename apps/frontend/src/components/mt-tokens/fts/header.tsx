'use client';

import { use } from 'react';

import { MTTokenRes } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { TokenImage } from '@/components/token';
import { Truncate, TruncateText } from '@/components/truncate';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  cid: string;
  loading?: boolean;
  tid: string;
  tokenPromise?: Promise<MTTokenRes>;
};

export const MtFtHeader = ({ cid, loading, tid, tokenPromise }: Props) => {
  const result = !loading && tokenPromise ? use(tokenPromise) : null;
  const token = result?.data ?? null;

  return (
    <SkeletonSlot
      fallback={
        <span className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <span className="block">
            <Skeleton className="w-32" />
          </span>
        </span>
      }
      loading={!!loading}
    >
      {() => (
        <span className="flex items-center gap-2">
          <TokenImage
            alt={token?.name ?? cid}
            className="size-6 rounded-full border"
            src={token?.icon ?? ''}
          />
          <Truncate className="flex items-center gap-2">
            <TruncateText
              className="text-foreground max-w-60"
              text={token?.name ?? token?.token ?? tid}
            />
          </Truncate>
          {token?.symbol && (
            <Truncate>
              (
              <TruncateText
                className="text-foreground max-w-30"
                text={token.symbol}
              />
              )
            </Truncate>
          )}
        </span>
      )}
    </SkeletonSlot>
  );
};
