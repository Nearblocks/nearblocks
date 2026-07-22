'use client';

import { Tooltip, XAxis, YAxis } from '@highcharts/react';
import { Column } from '@highcharts/react/series';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { use, useMemo } from 'react';

import { IntentsAssetPoint } from 'nb-schemas';

import { AnalyticsChart } from '@/components/address/analytics/chart';
import { ChartEmpty } from '@/components/charts';
import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, dateFormat } from '@/lib/format';
import { Card, CardContent, CardHeader } from '@/ui/card';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<IntentsAssetPoint[] | null>;
};

// Colors 0-15 are defined in globals.css (--highcharts-color-0..15); pass
// that count to Highcharts so it cycles through all of them via the same
// native class-based mechanism that colors both the chart and the legend,
// instead of custom per-series overrides (which fell out of sync between
// the bars and the legend swatches).
const COLOR_COUNT = 16;
const TOP_N = COLOR_COUNT - 1;

// Pivots per-(date, asset) rows into one time series per top-N asset (by
// volume over the fetched window), folding the remainder into an "Others"
// series so the stack stays readable regardless of how many assets are
// active. Grouped by token_id (stable key, since the same symbol — e.g.
// "USDC" — commonly exists on several blockchains as distinct tokens);
// displayed using the token's symbol when known, disambiguated with the
// blockchain name when two top tokens share a symbol.
const getSeries = (stats: IntentsAssetPoint[] | null, othersLabel: string) => {
  const rows = stats ?? [];
  const totals = new Map<string, number>();
  const labels = new Map<string, string>();
  const blockchains = new Map<string, string>();

  for (const row of rows) {
    const value = row.volume_usd !== null ? +row.volume_usd : 0;
    totals.set(row.token_id, (totals.get(row.token_id) ?? 0) + value);
    if (row.symbol) labels.set(row.token_id, row.symbol);
    blockchains.set(row.token_id, row.blockchain);
  }

  const top = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N)
    .map(([tokenId]) => tokenId);
  const topSet = new Set(top);
  const OTHERS = '__others__';

  const dates = [...new Set(rows.map((row) => row.date))].sort();
  const byCategory = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const category = topSet.has(row.token_id) ? row.token_id : OTHERS;
    const perDate = byCategory.get(category) ?? new Map<string, number>();
    const value = row.volume_usd !== null ? +row.volume_usd : 0;
    perDate.set(row.date, (perDate.get(row.date) ?? 0) + value);
    byCategory.set(category, perDate);
  }

  const categories = [...top, ...(byCategory.has(OTHERS) ? [OTHERS] : [])];

  const symbolCounts = new Map<string, number>();
  for (const tokenId of top) {
    const symbol = labels.get(tokenId) ?? tokenId;
    symbolCounts.set(symbol, (symbolCounts.get(symbol) ?? 0) + 1);
  }

  const series = categories.map((category) => {
    const perDate = byCategory.get(category)!;
    const data: [number, number][] = dates.map((date) => [
      new Date(date).getTime(),
      perDate.get(date) ?? 0,
    ]);
    const isOthers = category === OTHERS;
    const symbol = labels.get(category) ?? category;
    const name = isOthers
      ? othersLabel
      : (symbolCounts.get(symbol) ?? 0) > 1
      ? `${symbol} (${blockchains.get(category)})`
      : symbol;
    return { data, key: category, name };
  });

  return { isEmpty: !dates.length, series };
};

const yAxisLabel = {
  formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
    return currencyFormat(+this.value, { notation: 'compact' });
  },
};

const makeTooltipFormatter = (totalLabel: string) =>
  function (this: Highcharts.Point) {
    const points = (this.points as Array<Highcharts.Point>) ?? [];
    const header = `<span>${dateFormat(this.x, 'MMM D, YYYY')}</span><br/>`;
    const rows = points.map((point, index) => {
      const val = currencyFormat(point.y, {
        maximumFractionDigits: 2,
        notation: 'compact',
      });
      return `<span class="flex items-center gap-x-1"><span style="color:var(--highcharts-color-${index})">●</span> ${point.series.name}: <span class="font-bold">${val}</span></span>`;
    });
    const total = points.reduce((sum, point) => sum + (point.y ?? 0), 0);
    const totalVal = currencyFormat(total, {
      maximumFractionDigits: 2,
      notation: 'compact',
    });
    const totalRow = `<span class="mt-1 flex items-center gap-x-1 border-t pt-1 font-bold">${totalLabel}: ${totalVal}</span>`;
    return header + rows.join('') + totalRow;
  };

export const IntentsVolumeAssetsChart = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('mts');
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  const { isEmpty, series } = useMemo(
    () =>
      getSeries(stats, t('nearIntents.dashboard.charts.assets.othersLabel')),
    [stats, t],
  );
  const tooltipFormatter = useMemo(
    () => makeTooltipFormatter(t('nearIntents.dashboard.charts.assets.total')),
    [t],
  );

  return (
    <Card>
      <CardHeader className="border-b">
        <p className="text-body-sm text-muted-foreground">
          {t('nearIntents.dashboard.charts.assets.title')}
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
                      text: t('nearIntents.dashboard.charts.assets.yAxis'),
                    }}
                  />
                  {series.map((s) => (
                    <Column.Series
                      data={s.data}
                      key={s.key}
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
