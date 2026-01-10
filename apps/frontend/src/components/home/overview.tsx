'use client';

import { use } from 'react';
import { LuArrowRightLeft, LuGlobe, LuPickaxe } from 'react-icons/lu';

import { DailyStatsRes, StatsRes } from 'nb-schemas';

import { TxnsChart } from '@/components/home/chart';
import { PriceChange } from '@/components/price-change';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { Near } from '@/icons/near';
import { NearCircle } from '@/icons/near-circle';
import { currencyFormat, gasFormat, numberFormat } from '@/lib/format';
import { Card } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  dailyStatsPromise?: Promise<DailyStatsRes['data']>;
  loading?: boolean;
  statsPromise?: Promise<StatsRes['data']>;
};

export const Overview = ({
  dailyStatsPromise,
  loading,
  statsPromise,
}: Props) => {
  const { t } = useLocale('home');
  const stats = !loading && statsPromise ? use(statsPromise) : null;
  const dailyStats =
    !loading && dailyStatsPromise ? use(dailyStatsPromise) : null;

  return (
    <Card className="px-3 py-3">
      <div className="lg:grid lg:grid-cols-[1fr_auto_1fr_auto] lg:items-stretch xl:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="divide-y">
          <div className="flex items-center gap-3 py-3">
            <div className="bg-muted rounded-lg p-3">
              <Near className="size-6" />
            </div>
            <div>
              <h3 className="text-body-xs text-muted-foreground uppercase">
                {t('overview.price')}
              </h3>
              <p className="text-headline-base mt-0.5 flex flex-wrap items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="w-45" />}
                  loading={loading || !stats}
                >
                  {() => (
                    <>
                      {currencyFormat(stats!.near_price)}{' '}
                      <span className="text-muted-foreground">
                        @
                        {numberFormat(stats!.near_btc_price, {
                          maximumFractionDigits: 6,
                        })}{' '}
                        BTC
                      </span>{' '}
                      <PriceChange
                        change={stats!.change_24h}
                        className="text-headline-xs"
                      />
                    </>
                  )}
                </SkeletonSlot>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="bg-muted rounded-lg p-3">
              <LuGlobe className="size-6" />
            </div>
            <div>
              <h3 className="text-body-xs text-muted-foreground uppercase">
                {t('overview.marketCap')}
              </h3>
              <p className="text-headline-base mt-0.5">
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
        <Separator className="hidden lg:mx-4 lg:block" orientation="vertical" />
        <div className="divide-y">
          <div className="flex items-center gap-3 py-3">
            <div className="bg-muted rounded-lg p-3">
              <LuArrowRightLeft className="size-6" />
            </div>
            <div className="flex grow flex-wrap justify-between gap-2">
              <div>
                <h3 className="text-body-xs text-muted-foreground uppercase">
                  {t('overview.transactions')}
                </h3>
                <p className="text-headline-base mt-0.5 flex items-center gap-1">
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
                        <span className="text-muted-foreground">
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
                <p className="text-headline-base mt-0.5 flex items-center gap-1">
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
              <LuPickaxe className="size-6" />
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
        <Separator className="col-span-3 my-2 xl:my-0 xl:hidden" />
        <Separator className="hidden xl:mx-4 xl:block" orientation="vertical" />
        <div className="z-0 col-span-3 min-w-0 xl:col-auto">
          <h3 className="text-body-xs text-muted-foreground pb-2 uppercase">
            {t('chart.title')}
          </h3>
          <div className="flex items-start">
            <SkeletonSlot
              fallback={<Skeleton className="h-[115px] w-full" />}
              loading={loading || !dailyStats}
            >
              {() => <TxnsChart data={dailyStats ?? []} />}
            </SkeletonSlot>
          </div>
        </div>
      </div>
    </Card>
  );
};
