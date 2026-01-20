'use client';

import { use } from 'react';

import { Stats } from 'nb-schemas';

import { PriceChange } from '@/components/price-change';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { currencyFormat } from '@/lib/format';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<null | Stats>;
};

export const NearPrice = ({ loading = false, statsPromise }: Props) => {
  const { t } = useLocale('layout');
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  return (
    <div className="text-headline-xs text-foreground hidden items-center gap-1 lg:flex">
      <span className="text-body-xs text-muted-foreground">
        {t('header.nearPrice')}:
      </span>
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
