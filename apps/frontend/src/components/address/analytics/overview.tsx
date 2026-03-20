'use client';

import { RiQuestionLine } from '@remixicon/react';
import dynamic from 'next/dynamic';
import { use } from 'react';

import { AccountStatsOverview, AccountTxnStats } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { dateFormat, numberFormat, toYearsAndDays } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

const Heatmap = dynamic(() => import('./heatmap').then((mod) => mod.Heatmap), {
  loading: () => <Skeleton className="h-46 w-full" />,
  ssr: false,
});

type Props = {
  heatmapPromise?: Promise<AccountTxnStats[] | null>;
  loading?: boolean;
  overviewPromise?: Promise<AccountStatsOverview | null>;
};

const Overview = ({ heatmapPromise, loading, overviewPromise }: Props) => {
  const { t } = useLocale('address');
  const overview = !loading && overviewPromise ? use(overviewPromise) : null;
  const heatmap = !loading && heatmapPromise ? use(heatmapPromise) : null;

  return (
    <div className="h-105">
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="px-3 py-4">
          <h3 className="text-body-xs text-muted-foreground flex items-center gap-1 uppercase">
            {t('analytics.overview.txnCount')}{' '}
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                {t('analytics.overview.txnCountTip')}
              </TooltipContent>
            </Tooltip>
          </h3>
          <p className="text-headline-base mt-0.5">
            <SkeletonSlot
              fallback={<Skeleton className="w-20" />}
              loading={loading || !overview}
            >
              {() => <>{numberFormat(overview!.txns)}</>}
            </SkeletonSlot>
          </p>
          <p className="text-body-xs text-muted-foreground mt-2">
            {t('analytics.overview.since')}{' '}
            <SkeletonSlot
              fallback={<Skeleton className="w-30" />}
              loading={loading || !overview}
            >
              {() => <>{dateFormat(overview!.first_day, 'ddd DD, MMM YYYY')}</>}
            </SkeletonSlot>
          </p>
        </Card>
        <Card className="px-3 py-4">
          <h3 className="text-body-xs text-muted-foreground flex items-center gap-1 uppercase">
            {t('analytics.overview.activeAge')}{' '}
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                {t('analytics.overview.activeAgeTip')}
              </TooltipContent>
            </Tooltip>
          </h3>
          <p className="text-headline-base mt-0.5">
            <SkeletonSlot
              fallback={<Skeleton className="w-30" />}
              loading={loading || !overview}
            >
              {() => <YearsAndDays dayCount={+overview!.active_days} />}
            </SkeletonSlot>
          </p>
          <p className="text-body-xs text-muted-foreground mt-2">
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !overview}
            >
              {() => (
                <>
                  {dateFormat(overview!.first_day, 'ddd DD, MMM YYYY')} -{' '}
                  {dateFormat(overview!.last_day, 'ddd DD, MMM YYYY')}
                </>
              )}
            </SkeletonSlot>
          </p>
        </Card>
        <Card className="px-3 py-4">
          <h3 className="text-body-xs text-muted-foreground flex items-center gap-1 uppercase">
            {t('analytics.overview.uniqueDays')}{' '}
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                {t('analytics.overview.uniqueDaysTip')}
              </TooltipContent>
            </Tooltip>
          </h3>
          <p className="text-headline-base mt-0.5">
            <SkeletonSlot
              fallback={<Skeleton className="w-30" />}
              loading={loading || !overview}
            >
              {() => <YearsAndDays dayCount={+overview!.unique_days} />}
            </SkeletonSlot>
          </p>
          <p className="text-body-xs text-muted-foreground mt-2">
            {t('analytics.overview.since')}{' '}
            <SkeletonSlot
              fallback={<Skeleton className="w-30" />}
              loading={loading || !overview}
            >
              {() => <>{dateFormat(overview!.first_day, 'ddd DD, MMM YYYY')}</>}
            </SkeletonSlot>
          </p>
        </Card>
        <Card className="px-3 py-4">
          <h3 className="text-body-xs text-muted-foreground flex items-center gap-1 uppercase">
            {t('analytics.overview.longestStreak')}{' '}
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                {t('analytics.overview.longestStreakTip')}
              </TooltipContent>
            </Tooltip>
          </h3>
          <p className="text-headline-base mt-0.5">
            <SkeletonSlot
              fallback={<Skeleton className="w-30" />}
              loading={loading || !overview}
            >
              {() => <YearsAndDays dayCount={+overview!.longest_streak.days} />}
            </SkeletonSlot>
          </p>
          <p className="text-body-xs text-muted-foreground mt-2">
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !overview}
            >
              {() => (
                <>
                  {dateFormat(
                    overview!.longest_streak.start,
                    'ddd DD, MMM YYYY',
                  )}{' '}
                  -{' '}
                  {dateFormat(overview!.longest_streak.end, 'ddd DD, MMM YYYY')}
                </>
              )}
            </SkeletonSlot>
          </p>
        </Card>
      </div>
      <Card>
        <CardHeader className="border-b py-3">
          <CardTitle className="text-headline-sm">
            {t('analytics.overview.heatmap')}
          </CardTitle>
          {/* <span className="text-muted-foreground">{rangeLabel}</span> */}
        </CardHeader>
        <CardContent className="h-64 px-3 py-5">
          <SkeletonSlot
            fallback={<Skeleton className="h-54 w-full" />}
            loading={loading || !heatmap}
          >
            {() => <Heatmap data={heatmap ?? []} />}
          </SkeletonSlot>
        </CardContent>
      </Card>
    </div>
  );
};

const YearsAndDays = ({ dayCount }: { dayCount: number }) => {
  const { t } = useLocale('address');
  const { days, years } = toYearsAndDays(dayCount);

  if (!years)
    return `${days} ${
      days === 1 ? t('analytics.overview.day') : t('analytics.overview.days')
    }`;

  return `${years} ${
    years === 1 ? t('analytics.overview.year') : t('analytics.overview.years')
  } ${days} ${
    days === 1 ? t('analytics.overview.day') : t('analytics.overview.days')
  }`;
};

export default Overview;
