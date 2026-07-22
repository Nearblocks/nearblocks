'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Area } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo, useState } from 'react';

import { AddressStats, DailyTxnStats } from 'nb-schemas';

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
  addressStatsPromise?: Promise<AddressStats[] | null>;
  loading?: boolean;
  txnStatsPromise?: Promise<DailyTxnStats[] | null>;
};

const getMetaTxns = (txns: DailyTxnStats[] | null) =>
  (txns ?? [])
    .toReversed()
    .filter((item) => item.meta_txns !== null)
    .map(
      (item) =>
        [new Date(item.date).getTime(), +item.meta_txns!] as [number, number],
    );

const getMetaAccounts = (addrs: AddressStats[] | null) =>
  (addrs ?? [])
    .toReversed()
    .filter((item) => item.meta_accounts !== null)
    .map(
      (item) =>
        [new Date(item.date).getTime(), +item.meta_accounts!] as [
          number,
          number,
        ],
    );

const getRelayersByDate = (addrs: AddressStats[] | null) =>
  new Map(
    (addrs ?? [])
      .filter((item) => item.meta_relayers !== null)
      .map((item) => [new Date(item.date).getTime(), +item.meta_relayers!]),
  );

const yAxisLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return numberFormat(+this.value, { notation: 'compact' });
  },
};

const makeTooltipFormatter = (
  relayersByDate: Map<number, number>,
  relayersLabel: string,
) =>
  function (this: Highcharts.Point) {
    const header = `<span>${dateFormat(this.x, 'MMM D, YYYY')}</span><br/>`;
    const rows = (this.points as Array<Highcharts.Point>)?.map(
      (point, index) => {
        const val = numberFormat(point.y, { notation: 'compact' });
        return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">●</span> ${point.series.name}: <span class="font-bold">${val}</span></span>`;
      },
    );

    const relayers = relayersByDate.get(+this.x);
    const relayersRow =
      relayers !== undefined
        ? `<span class="flex items-center gap-x-1"><span style="color:transparent">●</span> ${relayersLabel}: <span class="font-bold">${numberFormat(
            relayers,
            { notation: 'compact' },
          )}</span></span>`
        : '';

    return header + (rows?.join('') ?? '') + relayersRow;
  };

export const MetaTxnsChart = ({
  addressStatsPromise,
  loading,
  txnStatsPromise,
}: Props) => {
  const { t } = useLocale('charts');
  const [logView, setLogView] = useState(false);
  const txns = !loading && txnStatsPromise ? use(txnStatsPromise) : null;
  const addrs =
    !loading && addressStatsPromise ? use(addressStatsPromise) : null;

  const metaTxnsData = useMemo(() => getMetaTxns(txns), [txns]);
  const metaAccountsData = useMemo(() => getMetaAccounts(addrs), [addrs]);
  const relayersByDate = useMemo(() => getRelayersByDate(addrs), [addrs]);
  const tooltipFormatter = useMemo(
    () => makeTooltipFormatter(relayersByDate, t('metaTxns.seriesRelayers')),
    [relayersByDate, t],
  );
  const isEmpty = !metaTxnsData.length && !metaAccountsData.length;

  return (
    <Card>
      <ChartHeader
        description={t('metaTxns.description')}
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
                    title={{ text: t('metaTxns.yAxis') }}
                    type={logView ? 'logarithmic' : 'linear'}
                  />
                  <Area.Series
                    data={metaTxnsData}
                    options={{
                      id: 'metaTxns',
                      name: t('metaTxns.seriesTxns'),
                      yAxis: 0,
                    }}
                  />
                  <Area.Series
                    data={metaAccountsData}
                    options={{
                      id: 'metaAccounts',
                      name: t('metaTxns.seriesAccounts'),
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

export const MetaTxnsChartMini = ({ loading, txnStatsPromise }: Props) => {
  const { t } = useLocale('charts');
  const txns = !loading && txnStatsPromise ? use(txnStatsPromise) : null;

  const metaTxnsData = useMemo(() => getMetaTxns(txns), [txns]);
  const isEmpty = !metaTxnsData.length;
  const tooltipFormatter = useMemo(
    () => makeTooltipFormatter(new Map(), t('metaTxns.seriesRelayers')),
    [t],
  );

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
                data={metaTxnsData}
                options={{ name: t('metaTxns.seriesTxns') }}
              />
              <Tooltip formatter={tooltipFormatter} shared />
            </MiniChart>
          )
        }
      </SkeletonSlot>
    </div>
  );
};
