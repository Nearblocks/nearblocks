'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Column, Line } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { ChartLine } from 'lucide-react';
import { use, useMemo } from 'react';

import { AccountMTStats } from 'nb-schemas';

import { EmptyBox } from '@/components/empty';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { dateFormat, numberFormat } from '@/lib/format';
import { Skeleton } from '@/ui/skeleton';

import { AnalyticsChart } from './chart';

type Props = {
  loading?: boolean;
  mtsPromise?: Promise<AccountMTStats[] | null>;
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
    return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">●</span> ${
      point.series.name
    }: <span class="font-bold align-middle">${numberFormat(
      point.y,
    )}</span></span>`;
  });

  return header + (rows?.join('') ?? '');
};

export const MTsChart = ({ loading, mtsPromise }: Props) => {
  const { t } = useLocale('address');
  const stats = !loading && mtsPromise ? use(mtsPromise) : null;

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

    return {
      contracts,
      isEmpty: stats?.length === 0,
      transfers,
      uniqueIn,
      uniqueOut,
    };
  }, [stats]);

  return (
    <div className="h-105">
      <SkeletonSlot
        fallback={<Skeleton className="h-105 w-full" />}
        loading={loading || !stats}
      >
        {() =>
          data.isEmpty ? (
            <div className="flex h-full">
              <EmptyBox
                description={t('analytics.noData')}
                icon={<ChartLine />}
              />
            </div>
          ) : (
            <AnalyticsChart>
              <XAxis className="stroke-0" type="datetime" />
              <YAxis
                className="stroke-0"
                labels={countLabel}
                opposite={false}
                title={{ text: t('analytics.mts.transfersCount') }}
              />
              <Column.Series
                data={data.transfers}
                options={{
                  id: 'transfers',
                  name: t('analytics.mts.transfers'),
                  yAxis: 0,
                }}
              />
              <YAxis
                className="stroke-0"
                labels={storageLabel}
                title={{ text: t('analytics.mts.count') }}
              />
              <Line.Series
                data={data.contracts}
                options={{
                  id: 'contracts',
                  name: t('analytics.mts.contracts'),
                  yAxis: 1,
                }}
              />
              <Line.Series
                data={data.uniqueIn}
                options={{
                  id: 'uniqueIn',
                  name: t('analytics.mts.uniqueOut'),
                  yAxis: 1,
                }}
              />
              <Line.Series
                data={data.uniqueOut}
                options={{
                  id: 'uniqueOut',
                  name: t('analytics.mts.uniqueIn'),
                  yAxis: 1,
                }}
              />
              <Tooltip formatter={tooltipFormatter} shared />
            </AnalyticsChart>
          )
        }
      </SkeletonSlot>
    </div>
  );
};
