'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { ChartLine } from 'lucide-react';
import { use, useMemo } from 'react';

import { ValidatorBlockStats, ValidatorChunkStats } from 'nb-schemas';

import { AnalyticsChart } from '@/components/address/analytics/chart';
import { EmptyBox } from '@/components/empty';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { dateFormat, numberFormat } from '@/lib/format';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  blocksPromise?: Promise<null | ValidatorBlockStats[]>;
  chunksPromise?: Promise<null | ValidatorChunkStats[]>;
  loading?: boolean;
};

const countLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return numberFormat(this.value, {
      maximumFractionDigits: 0,
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

export const ProductionChart = ({
  blocksPromise,
  chunksPromise,
  loading,
}: Props) => {
  const { t } = useLocale('validators');
  const blockStats = !loading && blocksPromise ? use(blocksPromise) : null;
  const chunkStats = !loading && chunksPromise ? use(chunksPromise) : null;

  const data = useMemo(() => {
    const blocks: [number, number][] = [];
    const chunks: [number, number][] = [];

    for (const item of (blockStats ?? []).toReversed()) {
      blocks.push([new Date(item.date).getTime(), +item.blocks]);
    }

    for (const item of (chunkStats ?? []).toReversed()) {
      chunks.push([new Date(item.date).getTime(), +item.chunks]);
    }

    return {
      blocks,
      chunks,
      isEmpty: !blockStats?.length && !chunkStats?.length,
    };
  }, [blockStats, chunkStats]);

  return (
    <Card>
      <CardContent className="p-3">
        <div className="h-105">
          <SkeletonSlot
            fallback={<Skeleton className="h-105 w-full" />}
            loading={!!loading}
          >
            {() =>
              data.isEmpty ? (
                <div className="flex h-full">
                  <EmptyBox
                    description={t('nodeDetails.analytics.noData')}
                    icon={<ChartLine />}
                  />
                </div>
              ) : (
                <AnalyticsChart>
                  <XAxis className="stroke-0" type="datetime" />
                  <YAxis className="stroke-0" labels={countLabel} />
                  <Line.Series
                    data={data.blocks}
                    options={{
                      id: 'blocks',
                      name: t('nodeDetails.analytics.blocks'),
                      yAxis: 0,
                    }}
                  />
                  <Line.Series
                    data={data.chunks}
                    options={{
                      id: 'chunks',
                      name: t('nodeDetails.analytics.chunks'),
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
