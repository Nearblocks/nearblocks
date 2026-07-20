'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Column, Line } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { ChartLine } from 'lucide-react';
import { use, useMemo } from 'react';

import type {
  MTContractStatsAccountTransfersRes,
  MTContractStatsTransfersRes,
} from 'nb-schemas';

import { AnalyticsChart } from '@/components/address/analytics/chart';
import { EmptyBox } from '@/components/empty';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { dateFormat, numberFormat } from '@/lib/format';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  accountTransfersPromise?: Promise<MTContractStatsAccountTransfersRes>;
  loading?: boolean;
  transfersPromise?: Promise<MTContractStatsTransfersRes>;
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
  const header = `<span>${dateFormat(this.x, 'MMM D, YYYY')}</span><br/>`;
  const rows = (this.points as Array<Highcharts.Point>)?.map(
    (point, index) =>
      `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">●</span> ${
        point.series.name
      }: <span class="font-bold">${numberFormat(point.y)}</span></span>`,
  );
  return header + (rows?.join('') ?? '');
};

export const TransfersChart = ({
  accountTransfersPromise,
  loading,
  transfersPromise,
}: Props) => {
  const { t } = useLocale('mts');

  const contractStats =
    !loading && transfersPromise ? use(transfersPromise) : undefined;
  const accountStats =
    !loading && accountTransfersPromise
      ? use(accountTransfersPromise)
      : undefined;

  const contractData = useMemo(() => {
    const stats = contractStats?.data ?? null;
    const transfers = [];
    const senders = [];
    const receivers = [];
    const reversed = (stats ?? []).toReversed();

    for (const item of reversed) {
      const timestamp = new Date(item.date).getTime();
      transfers.push([timestamp, +item.transfers_count]);
      senders.push([timestamp, +item.unique_senders]);
      receivers.push([timestamp, +item.unique_receivers]);
    }

    return { isEmpty: !stats?.length, receivers, senders, transfers };
  }, [contractStats]);

  const accountData = useMemo(() => {
    const stats = accountStats?.data ?? null;
    const transfers = [];
    const uniqueIn = [];
    const uniqueOut = [];
    const reversed = (stats ?? []).toReversed();

    for (const item of reversed) {
      const timestamp = new Date(item.date).getTime();
      transfers.push([timestamp, +item.transfers]);
      uniqueIn.push([timestamp, +item.unique_address_in]);
      uniqueOut.push([timestamp, +item.unique_address_out]);
    }

    return { isEmpty: !stats?.length, transfers, uniqueIn, uniqueOut };
  }, [accountStats]);

  const isLoading = !!loading;
  const isAccount = !!accountTransfersPromise;
  const isEmpty = isAccount ? accountData.isEmpty : contractData.isEmpty;

  return (
    <div className="h-105">
      <SkeletonSlot
        fallback={<Skeleton className="h-105 w-full" />}
        loading={isLoading}
      >
        {() =>
          isEmpty ? (
            <div className="flex h-full">
              <EmptyBox
                description={t('analytics.noData')}
                icon={<ChartLine />}
              />
            </div>
          ) : isAccount ? (
            <AnalyticsChart>
              <XAxis className="stroke-0" type="datetime" />
              <YAxis
                className="stroke-0"
                labels={countLabel}
                opposite={false}
                title={{ text: t('analytics.transfers.transfersCount') }}
              />
              <Column.Series
                data={accountData.transfers}
                options={{
                  id: 'transfers',
                  name: t('analytics.transfers.transfers'),
                  yAxis: 0,
                }}
              />
              <YAxis
                className="stroke-0"
                labels={countLabel}
                title={{ text: t('analytics.transfers.count') }}
              />
              <Line.Series
                data={accountData.uniqueIn}
                options={{
                  id: 'uniqueIn',
                  name: t('analytics.transfers.senders'),
                  yAxis: 1,
                }}
              />
              <Line.Series
                data={accountData.uniqueOut}
                options={{
                  id: 'uniqueOut',
                  name: t('analytics.transfers.receivers'),
                  yAxis: 1,
                }}
              />
              <Tooltip formatter={tooltipFormatter} shared />
            </AnalyticsChart>
          ) : (
            <AnalyticsChart>
              <XAxis className="stroke-0" type="datetime" />
              <YAxis
                className="stroke-0"
                labels={countLabel}
                opposite={false}
                title={{ text: t('analytics.transfers.transfersCount') }}
              />
              <Column.Series
                data={contractData.transfers}
                options={{
                  id: 'transfers',
                  name: t('analytics.transfers.transfers'),
                  yAxis: 0,
                }}
              />
              <YAxis
                className="stroke-0"
                labels={countLabel}
                title={{ text: t('analytics.transfers.count') }}
              />
              <Line.Series
                data={contractData.senders}
                options={{
                  id: 'senders',
                  name: t('analytics.transfers.senders'),
                  yAxis: 1,
                }}
              />
              <Line.Series
                data={contractData.receivers}
                options={{
                  id: 'receivers',
                  name: t('analytics.transfers.receivers'),
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
