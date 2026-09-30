'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo } from 'react';

import { TvlStats } from 'nb-schemas';

import { AnalyticsChart } from '@/components/address/analytics/chart';
import { ChartEmpty } from '@/components/charts';
import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, dateFormat } from '@/lib/format';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<null | TvlStats[]>;
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

const getData = (stats: null | TvlStats[]) =>
  (stats ?? [])
    .toReversed()
    .filter((item) => item.tvl_usd !== null)
    .map(
      (item) =>
        [new Date(item.date).getTime(), +item.tvl_usd!] as [number, number],
    );

export const ChainSignaturesTvlChart = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('chainSignatures');
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const data = useMemo(() => getData(stats), [stats]);
  const isEmpty = !data.length;

  return (
    // Fixed-height wrapper so the server-rendered markup reserves the chart
    // height; the chart itself only renders client-side after Highcharts
    // mounts.
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
                title={{ text: t('analytics.tvl.yAxis') }}
              />
              <Area.Series
                data={data}
                options={{ name: t('analytics.tvl.yAxis') }}
              />
              <Tooltip formatter={tooltipFormatter} shared />
            </AnalyticsChart>
          )
        }
      </SkeletonSlot>
    </div>
  );
};
