'use client';

import { ArrowRightLeft, Globe, Pickaxe } from 'lucide-react';
import dynamic from 'next/dynamic';
import { use } from 'react';

import { DailyStats, Stats } from 'nb-schemas';

import { PriceChange } from '@/components/price-change';
import { SkeletonSlot } from '@/components/skeleton';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { Near } from '@/icons/near';
import { NearCircle } from '@/icons/near-circle';
import { currencyFormat, gasFormat, numberFormat } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Card } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { Skeleton } from '@/ui/skeleton';

const TxnsChart = dynamic(
  () => import('@/components/home/chart').then((mod) => mod.TxnsChart),
  {
    loading: () => <Skeleton className="h-28.75 w-full" />,
    ssr: false,
  },
);

type Props = {
  dailyStatsPromise?: Promise<DailyStats[] | null>;
  loading?: boolean;
  statsPromise?: Promise<null | Stats>;
};

export const Overview = ({
  dailyStatsPromise,
  loading,
  statsPromise,
}: Props) => {
  const { t } = useLocale('home');
  const network = useConfig((s) => s.config.network);
  const stats = !loading && statsPromise ? use(statsPromise) : null;
  const dailyStats =
    !loading && dailyStatsPromise ? use(dailyStatsPromise) : null;
  const gridClass =
    network === 'mainnet'
      ? 'lg:grid lg:grid-cols-[1fr_auto_1fr_auto] lg:items-stretch xl:grid-cols-[1fr_auto_1fr_auto_1fr]'
      : 'lg:grid lg:grid-cols-[1fr_auto_1fr_auto] lg:items-stretch';
  const chartClass =
    network === 'mainnet'
      ? 'z-0 col-span-3 min-w-0 xl:col-auto'
      : 'z-0 min-w-0';
  const sep1Class =
    network === 'mainnet'
      ? 'col-span-3 my-2 xl:my-0 xl:hidden'
      : 'col-span-3 my-2 lg:my-0 lg:hidden';
  const sep2Class =
    network === 'mainnet'
      ? 'hidden xl:mx-4 xl:block'
      : 'hidden lg:mx-4 lg:block';

  return (
    <Card className="px-3 py-1">
      <div className={gridClass}>
        {network === 'mainnet' && (
          <>
            <div className="divide-border divide-y">
              <div className="flex items-center gap-3 py-3">
                <div className="bg-muted rounded-lg p-3">
                  <Near className="size-6" />
                </div>
                <div>
                  <h3 className="text-body-xs text-muted-foreground uppercase">
                    {t('overview.price')}
                  </h3>
                  <p className="text-headline-base mt-0.5 flex flex-wrap items-center gap-1 font-normal">
                    <SkeletonSlot
                      fallback={<Skeleton className="h-6 w-45" />}
                      loading={loading || !stats}
                    >
                      {() => (
                        <>
                          {currencyFormat(stats!.near_price)}{' '}
                          <span className="text-body-sm text-muted-foreground">
                            @{' '}
                            {numberFormat(stats!.near_btc_price, {
                              maximumFractionDigits: 6,
                            })}{' '}
                            BTC
                          </span>{' '}
                          <PriceChange change={stats!.change_24h} />
                        </>
                      )}
                    </SkeletonSlot>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <div className="bg-muted rounded-lg p-3">
                  <Globe className="size-6" />
                </div>
                <div>
                  <h3 className="text-body-xs text-muted-foreground uppercase">
                    {t('overview.marketCap')}
                  </h3>
                  <p className="text-headline-base mt-0.5 font-normal">
                    <SkeletonSlot
                      fallback={<Skeleton className="w-30" />}
                      loading={loading || !stats}
                    >
                      {() => (
                        <>
                          {currencyFormat(stats!.market_cap, {
                            maximumFractionDigits: 0,
                          })}
                        </>
                      )}
                    </SkeletonSlot>
                  </p>
                </div>
              </div>
            </div>
            <Separator className="lg:hidden" />
            <Separator
              className="hidden lg:mx-4 lg:block"
              orientation="vertical"
            />
          </>
        )}
        <div className="divide-y">
          <div className="flex items-center gap-3 py-3">
            <div className="bg-muted rounded-lg p-3">
              <ArrowRightLeft className="size-6" />
            </div>
            <div className="flex grow flex-wrap justify-between gap-2">
              <div>
                <h3 className="text-body-xs text-muted-foreground uppercase">
                  {t('overview.transactions')}
                </h3>
                <p className="text-headline-base mt-0.5 flex items-center gap-1 font-normal">
                  <SkeletonSlot
                    fallback={<Skeleton className="w-30" />}
                    loading={loading || !stats}
                  >
                    {() => (
                      <>
                        {numberFormat(stats!.total_txns, {
                          maximumFractionDigits: 2,
                          notation: 'compact',
                        })}{' '}
                        <span className="text-body-sm text-muted-foreground">
                          ({numberFormat(stats!.tps)} TPS)
                        </span>
                      </>
                    )}
                  </SkeletonSlot>
                </p>
              </div>
              <div className="ml-auto text-right">
                <h3 className="text-body-xs text-muted-foreground uppercase">
                  {t('overview.gas')}
                </h3>
                <p className="text-headline-base mt-0.5 flex items-center gap-1 font-normal">
                  <SkeletonSlot
                    fallback={<Skeleton className="w-32" />}
                    loading={loading || !stats}
                  >
                    {() => (
                      <>
                        <NearCircle className="size-4" />{' '}
                        {gasFormat(stats!.gas_price, {
                          maximumSignificantDigits: 4,
                        })}{' '}
                        / TGas
                      </>
                    )}
                  </SkeletonSlot>
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="bg-muted rounded-lg p-3">
              <Pickaxe className="size-6" />
            </div>
            <div className="flex grow flex-wrap items-center gap-2">
              <div>
                <h3 className="text-body-xs text-muted-foreground uppercase">
                  {t('overview.validators')}
                </h3>
                <p className="text-headline-base mt-0.5">
                  <SkeletonSlot
                    fallback={<Skeleton className="w-10" />}
                    loading={loading || !stats}
                  >
                    {() => <>{numberFormat(stats!.nodes_online)}</>}
                  </SkeletonSlot>
                </p>
              </div>
              <div className="ml-auto text-right">
                <h3 className="text-body-xs text-muted-foreground uppercase">
                  {t('overview.blockTime')}
                </h3>
                <p className="text-headline-base mt-0.5">
                  <SkeletonSlot
                    fallback={<Skeleton className="w-15" />}
                    loading={loading || !stats}
                  >
                    {() => (
                      <>
                        {numberFormat(stats!.avg_block_time, {
                          maximumFractionDigits: 4,
                        })}
                        s
                      </>
                    )}
                  </SkeletonSlot>
                </p>
              </div>
            </div>
          </div>
        </div>
        <Separator className={sep1Class} />
        <Separator className={sep2Class} orientation="vertical" />
        <div className={cn(chartClass, 'flex flex-col justify-center')}>
          <h3 className="text-body-xs text-muted-foreground pb-1 uppercase">
            {t('chart.title')}
          </h3>
          <div className="flex items-start">
            <SkeletonSlot
              fallback={<Skeleton className="h-24 w-full" />}
              loading={!!loading}
            >
              {() => <TxnsChart data={dailyStats ?? []} />}
            </SkeletonSlot>
          </div>
        </div>
      </div>
    </Card>
  );
};
