'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo, useState } from 'react';

import { DailyTxnStats, PriceStats } from 'nb-schemas';

import { AnalyticsChart } from '@/components/address/analytics/chart';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, dateFormat } from '@/lib/format';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { ChartEmpty, ChartHeader } from '.';
import { ChartSkeleton } from './chart-skeleton';
import { MiniChart } from './mini-chart';

type Props = {
  loading?: boolean;
  priceStatsPromise?: Promise<null | PriceStats[]>;
  txnStatsPromise?: Promise<DailyTxnStats[] | null>;
};

const getData = (txns: DailyTxnStats[] | null, prices: null | PriceStats[]) => {
  const priceMap = new Map(
    (prices ?? []).map((item) => [item.date, item.near_price]),
  );

  return (txns ?? [])
    .toReversed()
    .filter(
      (item) => item.txn_volume !== null && priceMap.get(item.date) != null,
    )
    .map(
      (item) =>
        [
          new Date(item.date).getTime(),
          +item.txn_volume! * +priceMap.get(item.date)!,
        ] as [number, number],
    );
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
    return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">\u25CF</span> ${point.series.name}: <span class="font-bold">${val}</span></span>`;
  });
  return header + (rows?.join('') ?? '');
};

export const TxnVolumeChart = ({
  loading,
  priceStatsPromise,
  txnStatsPromise,
}: Props) => {
  const { t } = useLocale('charts');
  const [logView, setLogView] = useState(false);
  const txns = !loading && txnStatsPromise ? use(txnStatsPromise) : null;
  const prices = !loading && priceStatsPromise ? use(priceStatsPromise) : null;

  const data = useMemo(() => getData(txns, prices), [txns, prices]);
  const isEmpty = !data.length;

  return (
    <Card>
      <ChartHeader
        description={t('txnVolume.description')}
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
                    labels={yAxisLabel}
                    opposite={false}
                    title={{ text: t('txnVolume.yAxis') }}
                    type={logView ? 'logarithmic' : 'linear'}
                  />
                  <Area.Series
                    data={data}
                    options={{ name: t('txnVolume.series') }}
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

export const TxnVolumeChartMini = ({
  loading,
  priceStatsPromise,
  txnStatsPromise,
}: Props) => {
  const { t } = useLocale('charts');
  const txns = !loading && txnStatsPromise ? use(txnStatsPromise) : null;
  const prices = !loading && priceStatsPromise ? use(priceStatsPromise) : null;

  const data = useMemo(() => getData(txns, prices), [txns, prices]);
  const isEmpty = !data.length;

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
                data={data}
                options={{ name: t('txnVolume.series') }}
              />
              <Tooltip formatter={tooltipFormatter} shared />
            </MiniChart>
          )
        }
      </SkeletonSlot>
    </div>
  );
};
