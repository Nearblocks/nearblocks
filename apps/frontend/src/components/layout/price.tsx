'use client';

import { use } from 'react';

import { Stats } from 'nb-schemas';

import { PriceChange } from '@/components/price-change';
import { SkeletonSlot } from '@/components/skeleton';
import { currencyFormat } from '@/lib/format';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<Stats>;
};

export const NearPrice = ({ loading = false, statsPromise }: Props) => {
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  return (
    <div className="text-headline-xs text-foreground flex items-center gap-1">
      <span className="text-body-xs text-muted-foreground">NEAR Price:</span>
      <SkeletonSlot
        fallback={<Skeleton className="h-4 w-25" />}
        loading={loading || !stats || !stats.near_price}
      >
        {() => (
          <>
            {currencyFormat(stats!.near_price)}{' '}
            <PriceChange change={stats!.change_24h} />
          </>
        )}
      </SkeletonSlot>
    </div>
  );
};
