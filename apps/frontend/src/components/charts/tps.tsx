'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area, Line } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo, useState } from 'react';

import { TpsStats } from 'nb-schemas';

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
  statsPromise?: Promise<null | TpsStats[]>;
};

type SeriesData = { data: [number, number][]; id: string; name: string };

const getData = (stats: null | TpsStats[]): SeriesData[] => {
  const reversed = (stats ?? []).toReversed();

  const shardIds = [
    ...new Set(reversed.flatMap((item) => item.shards.map((s) => s.shard))),
  ].sort((a, b) => a - b);

  const totalSeries: SeriesData = {
    data: reversed.map((item) => [Number(item.date) * 1000, item.txns]),
    id: 'total',
    name: 'Total TPS',
  };

  const shardSeries: SeriesData[] = shardIds.map((id) => ({
    data: reversed.map((item) => {
      const s = item.shards.find((sh) => sh.shard === id);
      return [Number(item.date) * 1000, s ? s.txns : 0] as [number, number];
    }),
    id: `shard-${id}`,
    name: `Shard ${id}`,
  }));

  return [totalSeries, ...shardSeries];
};

const getMiniData = (stats: null | TpsStats[]): [number, number][] =>
  (stats ?? [])
    .toReversed()
    .map((item) => [Number(item.date) * 1000, item.txns]);

const yAxisLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return numberFormat(+this.value, {
      maximumFractionDigits: 2,
      notation: 'compact',
    });
  },
};

const tooltipFormatter = function (this: Highcharts.Point) {
  const header = `<span>${dateFormat(this.x, 'MMM D, YYYY HH:mm')}</span><br/>`;
  const rows = (this.points as Array<Highcharts.Point>)?.map((point, index) => {
    const val = numberFormat(point.y, { maximumFractionDigits: 4 });
    return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">●</span> ${point.series.name}: <span class="font-bold">${val}</span></span>`;
  });
  return header + (rows?.join('') ?? '');
};

export const TpsChart = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('charts');
  const [logView, setLogView] = useState(false);
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const series = useMemo(() => getData(stats), [stats]);
  const isEmpty = !stats?.length;

  return (
    <Card>
      <ChartHeader
        description={t('tps.description')}
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
                <AnalyticsChart height={560} showRangeSelector={false}>
                  <XAxis className="stroke-0" type="datetime" />
                  <YAxis
                    className="stroke-0"
                    labels={yAxisLabel}
                    opposite={false}
                    title={{ text: t('tps.yAxis') }}
                    type={logView ? 'logarithmic' : 'linear'}
                  />
                  {series.map((s) => (
                    <Line.Series
                      data={s.data}
                      key={s.id}
                      options={{ id: s.id, name: s.name }}
                    />
                  ))}
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

export const TpsChartMini = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('charts');
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const data = useMemo(() => getMiniData(stats), [stats]);
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
              <Area.Series data={data} options={{ name: t('tps.series') }} />
              <Tooltip formatter={tooltipFormatter} shared />
            </MiniChart>
          )
        }
      </SkeletonSlot>
    </div>
  );
};
