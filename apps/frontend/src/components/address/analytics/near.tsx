'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Column } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo } from 'react';

import { AccountNearStats } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { dateFormat, numberFormat, toNear } from '@/lib/format';
import { nearIcon } from '@/lib/utils';
import { Skeleton } from '@/ui/skeleton';

import { AnalyticsChart } from './chart';

type Props = {
  loading?: boolean;
  nearPromise?: Promise<AccountNearStats[] | null>;
};

const countLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return numberFormat(this.value, {
      maximumFractionDigits: 2,
      notation: 'compact',
    });
  },
};

const tooltipFormatter = function (this: Highcharts.Point) {
  const header = `<span>${dateFormat('en', this.x as number, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}</span><br/>`;

  const rows = (this.points as Array<Highcharts.Point>)?.map((point, index) => {
    return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">\u25CF</span> ${
      point.series.name
    }: <span class="font-bold align-middle">${
      nearIcon + ' ' + numberFormat(point.y)
    }</span></span>`;
  });

  return header + (rows?.join('') ?? '');
};

export const NearChart = ({ loading, nearPromise }: Props) => {
  const stats = !loading && nearPromise ? use(nearPromise) : null;

  const data = useMemo(() => {
    const amountIn = [];
    const amountOut = [];
    const reversed = (stats ?? []).toReversed();

    for (const item of reversed) {
      const timestamp = new Date(item.date).getTime();

      amountIn.push([timestamp, +toNear(item.amount_in)]);
      amountOut.push([timestamp, +toNear(item.amount_out)]);
    }

    return { amountIn, amountOut };
  }, [stats]);

  return (
    <div className="h-105">
      <SkeletonSlot
        fallback={<Skeleton className="h-105 w-full" />}
        loading={loading || !stats}
      >
        {() => (
          <AnalyticsChart>
            <XAxis className="stroke-0" type="datetime" />
            <YAxis
              className="stroke-0"
              labels={countLabel}
              opposite={false}
              title={{ text: 'Transfer Amounts' }}
            />
            <Column.Series
              data={data.amountOut}
              options={{ id: 'amountOut', name: 'Sent (Out)' }}
            />
            <Column.Series
              data={data.amountIn}
              options={{ id: 'amountIn', name: 'Received (In)' }}
            />
            <Tooltip formatter={tooltipFormatter} shared />
          </AnalyticsChart>
        )}
      </SkeletonSlot>
    </div>
  );
};
