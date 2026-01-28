'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo } from 'react';

import { AccountTxnStats } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { dateFormat, numberFormat } from '@/lib/format';
import { Skeleton } from '@/ui/skeleton';

import { AnalyticsChart } from './chart';

type Props = {
  loading?: boolean;
  txnsPromise?: Promise<AccountTxnStats[] | null>;
};

const txnsLabel = {
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
    }: <span class="font-bold align-middle">${numberFormat(
      point.y,
    )}</span></span>`;
  });

  return header + (rows?.join('') ?? '');
};

export const TxnsChart = ({ loading, txnsPromise }: Props) => {
  const stats = !loading && txnsPromise ? use(txnsPromise) : null;

  const data = useMemo(() => {
    const txns = [];
    const uniqueIn = [];
    const uniqueOut = [];
    const reversed = (stats ?? []).toReversed();

    for (const item of reversed) {
      const timestamp = new Date(item.date).getTime();

      txns.push([timestamp, +item.txns]);
      uniqueIn.push([timestamp, +item.unique_address_in]);
      uniqueOut.push([timestamp, +item.unique_address_out]);
    }

    return { txns, uniqueIn, uniqueOut };
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
              labels={txnsLabel}
              opposite={false}
              title={{ text: 'Count' }}
            />
            <Line.Series
              data={data.txns}
              options={{ id: 'txns', name: 'Transactions' }}
            />
            <Line.Series
              data={data.uniqueIn}
              options={{ id: 'in', name: 'Unique Incoming Addresses' }}
            />
            <Line.Series
              data={data.uniqueOut}
              options={{ id: 'out', name: 'Unique Outgoing Addresses' }}
            />
            <Tooltip formatter={tooltipFormatter} shared />
          </AnalyticsChart>
        )}
      </SkeletonSlot>
    </div>
  );
};
