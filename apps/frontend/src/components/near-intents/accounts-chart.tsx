'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo } from 'react';

import { IntentsDailyCountPoint } from 'nb-schemas';

import { AnalyticsChart } from '@/components/address/analytics/chart';
import { ChartEmpty } from '@/components/charts';
import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { dateFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader } from '@/ui/card';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<IntentsDailyCountPoint[] | null>;
};

const getData = (stats: IntentsDailyCountPoint[] | null) => {
  const reversed = (stats ?? []).toReversed();
  const daily: [number, number][] = reversed.map((item) => [
    new Date(item.date).getTime(),
    +item.daily,
  ]);

  return { daily };
};

const yAxisLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return numberFormat(+this.value, { notation: 'compact' });
  },
};

const tooltipFormatter = function (this: Highcharts.Point) {
  const header = `<span>${dateFormat(this.x, 'MMM D, YYYY')}</span><br/>`;
  const rows = (this.points as Array<Highcharts.Point>)?.map((point, index) => {
    const val = numberFormat(point.y, { notation: 'compact' });
    return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">●</span> ${point.series.name}: <span class="font-bold">${val}</span></span>`;
  });
  return header + (rows?.join('') ?? '');
};

export const IntentsAccountsChart = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('mts');
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const { daily } = useMemo(() => getData(stats), [stats]);
  const isEmpty = !daily.length;

  return (
    <Card>
      <CardHeader className="border-b">
        <p className="text-body-sm text-muted-foreground">
          {t('nearIntents.dashboard.charts.uniqueAccounts.title')}
        </p>
      </CardHeader>
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
                    title={{
                      text: t(
                        'nearIntents.dashboard.charts.uniqueAccounts.yAxis',
                      ),
                    }}
                  />
                  <Area.Series
                    data={daily}
                    options={{
                      dataGrouping: { enabled: false },
                      id: 'daily',
                      name: t(
                        'nearIntents.dashboard.charts.uniqueAccounts.seriesDaily',
                      ),
                      yAxis: 0,
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
