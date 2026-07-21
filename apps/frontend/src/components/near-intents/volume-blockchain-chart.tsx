'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Column } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo } from 'react';

import { IntentsBlockchainPoint } from 'nb-schemas';

import { AnalyticsChart } from '@/components/address/analytics/chart';
import { ChartEmpty } from '@/components/charts';
import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, dateFormat } from '@/lib/format';
import { Card, CardContent, CardHeader } from '@/ui/card';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<IntentsBlockchainPoint[] | null>;
};

// Colors 0-15 are defined in globals.css (--highcharts-color-0..15); pass
// that count to Highcharts so it cycles through all of them via the same
// native class-based mechanism that colors both the chart and the legend,
// instead of custom per-series overrides (which fell out of sync between
// the bars and the legend swatches).
const COLOR_COUNT = 16;
const TOP_N = COLOR_COUNT - 1;

// Pivots per-(date, blockchain) rows into one time series per top-N chain
// (by volume over the fetched window), folding the remainder into an
// "Others" series so the stack stays readable regardless of how many
// chains are active.
const getSeries = (
  stats: IntentsBlockchainPoint[] | null,
  othersLabel: string,
) => {
  const rows = stats ?? [];
  const totals = new Map<string, number>();

  for (const row of rows) {
    const value = row.volume !== null ? +row.volume : 0;
    totals.set(row.blockchain, (totals.get(row.blockchain) ?? 0) + value);
  }

  const top = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N)
    .map(([blockchain]) => blockchain);
  const topSet = new Set(top);
  const OTHERS = '__others__';

  const dates = [...new Set(rows.map((row) => row.date))].sort();
  const byCategory = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const category = topSet.has(row.blockchain) ? row.blockchain : OTHERS;
    const perDate = byCategory.get(category) ?? new Map<string, number>();
    const value = row.volume !== null ? +row.volume : 0;
    perDate.set(row.date, (perDate.get(row.date) ?? 0) + value);
    byCategory.set(category, perDate);
  }

  const categories = [...top, ...(byCategory.has(OTHERS) ? [OTHERS] : [])];

  const series = categories.map((category) => {
    const perDate = byCategory.get(category)!;
    const data: [number, number][] = dates.map((date) => [
      new Date(date).getTime(),
      perDate.get(date) ?? 0,
    ]);
    const name = category === OTHERS ? othersLabel : category;
    return { data, name };
  });

  return { isEmpty: !dates.length, series };
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
    return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">●</span> ${point.series.name}: <span class="font-bold">${val}</span></span>`;
  });
  return header + (rows?.join('') ?? '');
};

export const IntentsVolumeBlockchainChart = ({
  loading,
  statsPromise,
}: Props) => {
  const { t } = useLocale('mts');
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const { isEmpty, series } = useMemo(
    () =>
      getSeries(
        stats,
        t('nearIntents.dashboard.charts.blockchain.othersLabel'),
      ),
    [stats, t],
  );

  return (
    <Card>
      <CardHeader className="border-b">
        <p className="text-body-sm text-muted-foreground">
          {t('nearIntents.dashboard.charts.blockchain.title')}
        </p>
      </CardHeader>
      <CardContent className="p-3">
        <div className="h-140">
          <SkeletonSlot fallback={<ChartSkeleton />} loading={!!loading}>
            {() =>
              isEmpty ? (
                <ChartEmpty />
              ) : (
                <AnalyticsChart
                  colorCount={COLOR_COUNT}
                  height={560}
                  showRangeSelector={false}
                >
                  <XAxis className="stroke-0" type="datetime" />
                  <YAxis
                    className="stroke-0"
                    labels={yAxisLabel}
                    opposite={false}
                    title={{
                      text: t('nearIntents.dashboard.charts.blockchain.yAxis'),
                    }}
                  />
                  {series.map((s) => (
                    <Column.Series
                      data={s.data}
                      key={s.name}
                      options={{ name: s.name, stacking: 'normal' }}
                    />
                  ))}
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
