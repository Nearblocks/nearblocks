'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area, Line } from '@highcharts/react/series';
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

const getGasUsed = (stats: DailyBlockStats[] | null) =>
  (stats ?? [])
    .toReversed()
    .filter((item) => item.gas_used !== null)
    .map(
      (item) =>
        [new Date(item.date).getTime(), +item.gas_used! / 1e16] as [
          number,
          number,
        ],
    );

const getGasPrice = (stats: DailyBlockStats[] | null) =>
  (stats ?? [])
    .toReversed()
    .filter((item) => item.gas_price !== null)
    .map(
      (item) =>
        [new Date(item.date).getTime(), +item.gas_price! / 1e12] as [
          number,
          number,
        ],
    );

const yAxisLabelUsed = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return numberFormat(+this.value, { notation: 'compact' });
  },
};

const yAxisLabelPrice = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return numberFormat(+this.value, { maximumSignificantDigits: 4 });
  },
};

const tooltipFormatter = function (this: Highcharts.Point) {
  const header = `<span>${dateFormat(this.x, 'MMM D, YYYY')}</span><br/>`;
  const rows = (this.points as Array<Highcharts.Point>)?.map((point, index) => {
    const isPrice = point.series.options.id === 'gasPrice';
    const val = numberFormat(
      point.y,
      isPrice
        ? { maximumSignificantDigits: 4 }
        : { maximumFractionDigits: 2, notation: 'compact' },
    );
    return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">●</span> ${point.series.name}: <span class="font-bold">${val}</span></span>`;
  });
  return header + (rows?.join('') ?? '');
};

export const GasChart = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('charts');
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const [logView, setLogView] = useState(false);
  const gasUsedData = useMemo(() => getGasUsed(stats), [stats]);
  const gasPriceData = useMemo(() => getGasPrice(stats), [stats]);
  const isEmpty = !gasUsedData.length && !gasPriceData.length;

  return (
    <Card>
      <ChartHeader
        description={t('gas.description')}
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
                    labels={yAxisLabelUsed}
                    opposite={false}
                    title={{ text: t('gas.yAxisUsed') }}
                    type={logView ? 'logarithmic' : 'linear'}
                  />
                  <Area.Series
                    data={gasUsedData}
                    options={{
                      id: 'gasUsed',
                      name: t('gas.seriesUsed'),
                      yAxis: 0,
                    }}
                  />
                  <YAxis
                    className="stroke-0"
                    labels={yAxisLabelPrice}
                    title={{ text: t('gas.yAxisPrice') }}
                    type={logView ? 'logarithmic' : 'linear'}
                  />
                  <Line.Series
                    data={gasPriceData}
                    options={{
                      id: 'gasPrice',
                      name: t('gas.seriesPrice'),
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

export const GasChartMini = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('charts');
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const gasUsedData = useMemo(() => getGasUsed(stats), [stats]);
  const isEmpty = !gasUsedData.length;

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
                data={gasUsedData}
                options={{ id: 'gasUsed', name: t('gas.seriesUsed') }}
              />
              <Tooltip formatter={tooltipFormatter} shared />
            </MiniChart>
          )
        }
      </SkeletonSlot>
    </div>
  );
};
