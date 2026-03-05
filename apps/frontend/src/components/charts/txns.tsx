'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area, Line } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo, useState } from 'react';

import { DailyStats } from 'nb-schemas';

import { AnalyticsChart } from '@/components/address/analytics/chart';
import { SkeletonSlot } from '@/components/skeleton';
import { dateFormat, numberFormat } from '@/lib/format';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { ChartHeader } from '.';
import { MiniChart } from './mini-chart';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<DailyStats[] | null>;
};

const getData = (stats: DailyStats[] | null) =>
  (stats ?? [])
    .toReversed()
    .filter((item) => item.txns !== null)
    .map(
      (item) =>
        [new Date(item.date).getTime(), +item.txns!] as [number, number],
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

export const TxnsChart = ({ loading, statsPromise }: Props) => {
  const [logView, setLogView] = useState(false);
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const data = useMemo(() => getData(stats), [stats]);

  return (
    <Card>
      <ChartHeader
        description="Near Unique Accounts chart shows the number of active accounts per day
          on the Near protocol."
        logView={logView}
        setLogView={setLogView}
      />
      <CardContent className="p-3">
        <SkeletonSlot
          fallback={<Skeleton className="h-140 w-full" />}
          loading={loading || !stats}
        >
          {() => (
            <AnalyticsChart height={560}>
              <XAxis className="stroke-0" type="datetime" />
              <YAxis
                className="stroke-0"
                labels={yAxisLabel}
                opposite={false}
                title={{ text: 'Transactions per Day' }}
                type={logView ? 'logarithmic' : 'linear'}
              />
              <Area.Series
                data={data}
                options={{ name: 'Transactions per Day' }}
              />
              <Tooltip formatter={tooltipFormatter} shared />
            </AnalyticsChart>
          )}
        </SkeletonSlot>
      </CardContent>
    </Card>
  );
};

export const TxnsChartMini = ({ loading, statsPromise }: Props) => {
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const data = useMemo(() => getData(stats), [stats]);

  return (
    <div className="h-55">
      <SkeletonSlot
        fallback={<Skeleton className="my-3 h-49 w-full" />}
        loading={loading || !stats}
      >
        {() => (
          <MiniChart height={220}>
            <Line.Series
              data={data}
              options={{ name: 'Transactions per Day' }}
            />
            <Tooltip formatter={tooltipFormatter} shared />
          </MiniChart>
        )}
      </SkeletonSlot>
    </div>
  );
};
