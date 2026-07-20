'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo, useState } from 'react';

import { DailyBlockStats } from 'nb-schemas';

import { AnalyticsChart } from '@/components/address/analytics/chart';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { dateFormat, numberFormat } from '@/lib/format';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { ChartEmpty, ChartHeader } from '.';
import { ChartSkeleton } from './chart-skeleton';
import { MiniChart } from './mini-chart';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<DailyBlockStats[] | null>;
};

const getData = (stats: DailyBlockStats[] | null) =>
  (stats ?? [])
    .toReversed()
    .filter((item) => item.blocks !== null)
    .map(
      (item) =>
        [new Date(item.date).getTime(), +item.blocks!] as [number, number],
    );

const yAxisLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return numberFormat(+this.value, { notation: 'compact' });
  },
};

const tooltipFormatter = function (this: Highcharts.Point) {
  const header = `<span>${dateFormat(this.x, 'MMM D, YYYY')}</span><br/>`;
  const rows = (this.points as Array<Highcharts.Point>)?.map((point, index) => {
    const val = numberFormat(point.y, { notation: 'compact' });
    return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">\u25CF</span> ${point.series.name}: <span class="font-bold">${val}</span></span>`;
  });
  return header + (rows?.join('') ?? '');
};

export const BlocksChart = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('charts');
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const [logView, setLogView] = useState(false);
  const data = useMemo(() => getData(stats), [stats]);
  const isEmpty = !data.length;

  return (
    <Card>
      <ChartHeader
        description={t('blocks.description')}
        logView={logView}
        setLogView={setLogView}
      />
      <CardContent className="p-3">
        <div className="h-140">
          <SkeletonSlot fallback={<ChartSkeleton />} loading={!!loading}>
            {() =>
              isEmpty ? (
                <ChartEmpty />
              ) : (
                <AnalyticsChart height={560}>
                  <XAxis className="stroke-0" type="datetime" />
                  <YAxis
                    className="stroke-0"
                    labels={yAxisLabel}
                    opposite={false}
                    title={{ text: t('blocks.yAxis') }}
                    type={logView ? 'logarithmic' : 'linear'}
                  />
                  <Area.Series
                    data={data}
                    options={{ name: t('blocks.series') }}
                  />
                  <Tooltip formatter={tooltipFormatter} shared />
                </AnalyticsChart>
              )
            }
          </SkeletonSlot>
        </div>
      </CardContent>
    </Card>
  );
};

export const BlocksChartMini = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('charts');
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const data = useMemo(() => getData(stats), [stats]);
  const isEmpty = !data.length;

  return (
    <div className="h-55">
      <SkeletonSlot
        fallback={<Skeleton className="my-3 h-49 w-full" />}
        loading={!!loading}
      >
        {() =>
          isEmpty ? (
            <ChartEmpty />
          ) : (
            <MiniChart height={220}>
              <Area.Series data={data} options={{ name: t('blocks.series') }} />
              <Tooltip formatter={tooltipFormatter} shared />
            </MiniChart>
          )
        }
      </SkeletonSlot>
    </div>
  );
};
