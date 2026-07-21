'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area, Column, Line } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo, useState } from 'react';

import { IntentsMetricPoint } from 'nb-schemas';

import { AnalyticsChart } from '@/components/address/analytics/chart';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, dateFormat } from '@/lib/format';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { ChartEmpty, ChartHeader } from '.';
import { ChartSkeleton } from './chart-skeleton';
import { MiniChart } from './mini-chart';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<IntentsMetricPoint[] | null>;
};

const getData = (stats: IntentsMetricPoint[] | null) => {
  const reversed = (stats ?? []).toReversed();
  const daily: [number, number][] = [];
  const cumulative: [number, number][] = [];

  for (const item of reversed) {
    const timestamp = new Date(item.date).getTime();
    if (item.daily !== null) daily.push([timestamp, +item.daily]);
    if (item.cumulative !== null)
      cumulative.push([timestamp, +item.cumulative]);
  }

  return { cumulative, daily };
};

const yAxisLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return currencyFormat(+this.value, { notation: 'compact' });
  },
};

const tooltipFormatter = function (this: Highcharts.Point) {
  const header = `<span>${dateFormat(this.x, 'MMM D, YYYY')}</span><br/>`;
  const rows = (this.points as Array<Highcharts.Point>)?.map((point, index) => {
    const val = currencyFormat(point.y, {
      maximumFractionDigits: 2,
      notation: 'compact',
    });
    return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">●</span> ${point.series.name}: <span class="font-bold">${val}</span></span>`;
  });
  return header + (rows?.join('') ?? '');
};

export const IntentsVolumeChart = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('charts');
  const [logView, setLogView] = useState(false);
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const { cumulative, daily } = useMemo(() => getData(stats), [stats]);
  const isEmpty = !daily.length;

  return (
    <Card>
      <ChartHeader
        description={t('intentsVolume.description')}
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
                    title={{ text: t('intentsVolume.yAxis') }}
                    type={logView ? 'logarithmic' : 'linear'}
                  />
                  <Column.Series
                    data={daily}
                    options={{
                      id: 'daily',
                      name: t('intentsVolume.seriesDaily'),
                      yAxis: 0,
                    }}
                  />
                  <YAxis
                    className="stroke-0"
                    labels={yAxisLabel}
                    title={{ text: t('intentsVolume.yAxisCumulative') }}
                  />
                  <Line.Series
                    data={cumulative}
                    options={{
                      id: 'cumulative',
                      name: t('intentsVolume.seriesCumulative'),
                      yAxis: 1,
                    }}
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

export const IntentsVolumeChartMini = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('charts');
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const { daily } = useMemo(() => getData(stats), [stats]);
  const isEmpty = !daily.length;

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
              <Area.Series
                data={daily}
                options={{ name: t('intentsVolume.seriesDaily') }}
              />
              <Tooltip formatter={tooltipFormatter} shared />
            </MiniChart>
          )
        }
      </SkeletonSlot>
    </div>
  );
};
