'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo } from 'react';

import { AccountBalanceStats } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { bytesFormat, dateFormat, numberFormat, toNear } from '@/lib/format';
import { nearIcon } from '@/lib/utils';
import { Skeleton } from '@/ui/skeleton';

import { AnalyticsChart } from './chart';

type Props = {
  balancePromise?: Promise<AccountBalanceStats[] | null>;
  loading?: boolean;
};

const balanceLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return numberFormat(this.value, {
      maximumFractionDigits: 2,
      notation: 'compact',
    });
  },
};

const storageLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return bytesFormat(this.value);
  },
};

const tooltipFormatter = function (this: Highcharts.Point) {
  const header = `<span>${dateFormat(this.x, 'MMM D, YYYY')}</span><br/>`;

  const rows = (this.points as Array<Highcharts.Point>)?.map((point, index) => {
    const value =
      point.series.options.id === 'storage'
        ? bytesFormat(point.y)
        : nearIcon + ' ' + numberFormat(point.y, { maximumFractionDigits: 2 });

    return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">\u25CF</span> ${point.series.name}: <span class="font-bold align-middle">${value}</span></span>`;
  });

  return header + (rows?.join('') ?? '');
};

export const BalanceChart = ({ balancePromise, loading }: Props) => {
  const stats = !loading && balancePromise ? use(balancePromise) : null;

  const data = useMemo(() => {
    const amount = [];
    const staked = [];
    const storage = [];
    const reversed = (stats ?? []).toReversed();

    for (const item of reversed) {
      const timestamp = new Date(item.date).getTime();

      amount.push([timestamp, +toNear(item.amount)]);
      staked.push([timestamp, +toNear(item.amount_staked)]);
      storage.push([timestamp, +item.storage_usage]);
    }

    return { amount, staked, storage };
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
              labels={balanceLabel}
              opposite={false}
              title={{ text: 'Balance' }}
            />
            <Line.Series
              data={data.amount}
              options={{ id: 'balance', name: 'Balance', yAxis: 0 }}
            />
            <Line.Series
              data={data.staked}
              options={{ id: 'staked', name: 'Staked Balance', yAxis: 0 }}
            />
            <YAxis
              className="stroke-0"
              labels={storageLabel}
              title={{ text: 'Storage Used' }}
            />
            <Line.Series
              data={data.storage}
              options={{ id: 'storage', name: 'Storage Used', yAxis: 1 }}
            />
            <Tooltip formatter={tooltipFormatter} shared />
          </AnalyticsChart>
        )}
      </SkeletonSlot>
    </div>
  );
};
