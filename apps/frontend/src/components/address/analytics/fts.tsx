'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Column, Line } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo } from 'react';

import { AccountFTStats } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { dateFormat, numberFormat } from '@/lib/format';
import { Skeleton } from '@/ui/skeleton';

import { AnalyticsChart } from './chart';

type Props = {
  ftsPromise?: Promise<AccountFTStats[] | null>;
  loading?: boolean;
};

const countLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return numberFormat(this.value, {
      maximumFractionDigits: 2,
      notation: 'compact',
    });
  },
};

const storageLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return numberFormat(this.value, {
      maximumFractionDigits: 2,
      notation: 'compact',
    });
  },
};

const tooltipFormatter = function (this: Highcharts.Point) {
  const header = `<span>${dateFormat(this.x, 'MMM D, YYYY')}</span><br/>`;

  const rows = (this.points as Array<Highcharts.Point>)?.map((point, index) => {
    return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">\u25CF</span> ${
      point.series.name
    }: <span class="font-bold align-middle">${numberFormat(
      point.y,
    )}</span></span>`;
  });

  return header + (rows?.join('') ?? '');
};

export const FTsChart = ({ ftsPromise, loading }: Props) => {
  const stats = !loading && ftsPromise ? use(ftsPromise) : null;

  const data = useMemo(() => {
    const transfers = [];
    const contracts = [];
    const uniqueIn = [];
    const uniqueOut = [];
    const reversed = (stats ?? []).toReversed();

    for (const item of reversed) {
      const timestamp = new Date(item.date).getTime();

      transfers.push([timestamp, +item.transfers]);
      contracts.push([timestamp, +item.contracts]);
      uniqueIn.push([timestamp, +item.unique_address_in]);
      uniqueOut.push([timestamp, +item.unique_address_out]);
    }

    return { contracts, transfers, uniqueIn, uniqueOut };
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
              title={{ text: 'Transfers Count' }}
            />
            <Column.Series
              data={data.transfers}
              options={{ id: 'transfers', name: 'Transfers', yAxis: 0 }}
            />
            <YAxis
              className="stroke-0"
              labels={storageLabel}
              title={{ text: 'Count' }}
            />
            <Line.Series
              data={data.contracts}
              options={{ id: 'contracts', name: 'Token Contracts', yAxis: 1 }}
            />
            <Line.Series
              data={data.uniqueIn}
              options={{
                id: 'uniqueIn',
                name: 'Unique Addresses Sent',
                yAxis: 1,
              }}
            />
            <Line.Series
              data={data.uniqueOut}
              options={{
                id: 'uniqueOut',
                name: 'Unique Addresses Received',
                yAxis: 1,
              }}
            />
            <Tooltip formatter={tooltipFormatter} shared />
          </AnalyticsChart>
        )}
      </SkeletonSlot>
    </div>
  );
};
