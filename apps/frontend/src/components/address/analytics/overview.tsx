'use client';

import { use } from 'react';
import { RiQuestionLine } from 'react-icons/ri';

import { AccountStatsOverview, AccountTxnStats } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { dateFormat, numberFormat, toYearsAndDays } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { Heatmap } from './heatmap';

type Props = {
  heatmapPromise?: Promise<AccountTxnStats[] | null>;
  loading?: boolean;
  overviewPromise?: Promise<AccountStatsOverview | null>;
};

const Overview = ({ heatmapPromise, loading, overviewPromise }: Props) => {
  const overview = !loading && overviewPromise ? use(overviewPromise) : null;
  const heatmap = !loading && heatmapPromise ? use(heatmapPromise) : null;

  return (
    <div className="h-105">
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="px-3 py-4">
          <h3 className="text-body-xs text-muted-foreground flex items-center gap-1 uppercase">
            Transaction Count{' '}
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                Count of normal transactions, internal transactions and token
                transfers involving this address
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
            Since{' '}
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
            Active Age{' '}
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                Number of days between the first and last transaction involving
                this address as either a sender or recipient
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
            Unique Days Active{' '}
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                Number of days this address has had activity onchain
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
            Since{' '}
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
            Longest Streak{' '}
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                Longest streak of consecutive days with onchain activity for
                this address
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
            Transaction Heatmap
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
  const { days, years } = toYearsAndDays(dayCount);

  if (!years) return `${days} ${days === 1 ? 'Day' : 'Days'}`;

  return `${years} ${years === 1 ? 'Year' : 'Years'} ${days} ${
    days === 1 ? 'Day' : 'Days'
  }`;
};

export default Overview;
