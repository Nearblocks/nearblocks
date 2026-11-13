'use client';

import { use, useMemo, useState } from 'react';

import { DailyTxnStats } from 'nb-schemas';

import { TimeSeriesChart } from '@/components/echarts/time-series';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { Card, CardContent } from '@/ui/card';

import { ChartEmpty, ChartHeader } from './chart-header';
import { ChartSkeleton } from './chart-skeleton';
import { getTxnsData } from './txns-data';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<DailyTxnStats[] | null>;
};

export const TxnsChart = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('charts');
  const [logView, setLogView] = useState(false);
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const data = useMemo(() => getTxnsData(stats), [stats]);
  const series = useMemo(
    () => [{ data, name: t('txns.series'), type: 'area' as const }],
    [data, t],
  );
  const isEmpty = !data.length;

  return (
    <Card>
      <ChartHeader
        description={t('txns.description')}
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
                <TimeSeriesChart
                  filename="near-daily-transactions"
                  label={t('txns.heading')}
                  logScale={logView}
                  series={series}
                  yAxisName={t('txns.yAxis')}
                />
              )
            }
          </SkeletonSlot>
        </div>
      </CardContent>
    </Card>
  );
};
