'use client';

import { Chart } from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import dayjs from 'dayjs';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { memo, useMemo } from 'react';

import { useLocale } from '@/hooks/use-locale';
import { dateFormat, numberFormat } from '@/lib/format';

type TxnsPoint = {
  date: Date | number | string;
  txns: number;
  uniqueIncoming: number;
  uniqueOutgoing: number;
};

type Props = {
  data?: TxnsPoint[];
  height?: number;
};

const createSampleData = (): TxnsPoint[] => {
  const end = dayjs().startOf('day');
  const start = end.subtract(32, 'month');
  const daysDiff = end.diff(start, 'day');
  const data: TxnsPoint[] = [];

  for (let i = 0; i <= daysDiff; i += 1) {
    const date = start.add(i, 'day');
    const wave = Math.sin(i / 12) * 0.4 + 0.8;
    const seasonal = Math.sin((i / 365) * Math.PI * 2) * 0.5 + 0.9;
    const trend = 0.6 + i / (daysDiff * 1.35);
    const txns = Math.max(0, Math.round(2000 * wave * seasonal * trend));
    const uniqueOutgoing = Math.round(txns * 0.05 + (i % 9));
    const uniqueIncoming = Math.round(txns * 0.04 + (i % 7));

    data.push({
      date: date.toDate(),
      txns,
      uniqueIncoming,
      uniqueOutgoing,
    });
  }

  return data;
};

export const NearChart = memo(({ data, height = 420 }: Props) => {
  const { locale } = useLocale();

  const { chartOptions, seriesData } = useMemo(() => {
    const resolvedData = data?.length ? data : createSampleData();
    const parsed = resolvedData
      .map((item) => {
        const timestamp = new Date(item.date).getTime();
        if (Number.isNaN(timestamp)) return null;
        return {
          txns: item.txns,
          uniqueIncoming: item.uniqueIncoming,
          uniqueOutgoing: item.uniqueOutgoing,
          x: timestamp,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => a.x - b.x);

    const transactions = parsed.map((item) => [item.x, item.txns] as const);
    const uniqueOutgoing = parsed.map(
      (item) => [item.x, item.uniqueOutgoing] as const,
    );
    const uniqueIncoming = parsed.map(
      (item) => [item.x, item.uniqueIncoming] as const,
    );

    const chartOptions = {
      chart: {
        backgroundColor: 'transparent',
        height,
        spacingBottom: 12,
        spacingLeft: 8,
        spacingRight: 8,
        spacingTop: 12,
        styledMode: true,
      },
      credits: { enabled: false },
      legend: {
        align: 'center' as const,
        enabled: true,
        verticalAlign: 'bottom' as const,
      },
      navigator: {
        margin: 16,
        outlineWidth: 0,
      },
      plotOptions: {
        series: {
          marker: { enabled: false },
        },
      },
      rangeSelector: {
        // buttonPosition: {
        //   align: 'right' as const,
        // },
        buttons: [
          { count: 1, text: '1M', type: 'month' as const },
          { count: 6, text: '6M', type: 'month' as const },
          { count: 1, text: '1Y', type: 'year' as const },
          { text: 'All', type: 'all' as const },
        ],
        buttonSpacing: 8,
        buttonTheme: {
          height: 28,
          padding: 0,
          r: 8,
          width: 32,
        },
        inputEnabled: false,
        selected: 3,
      },
      scrollbar: { enabled: false },
      tooltip: {
        formatter: function (this: Highcharts.Point) {
          const sharedPoints =
            (this as Highcharts.Point & { points?: Highcharts.Point[] })
              .points ?? [];
          const dateLabel = this.x
            ? dateFormat(locale, this.x, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '';

          const pointLines = sharedPoints
            .map((point) => {
              return `
                <span style="color:${point.color}">\u25CF</span>
                ${point.series.name}: <strong>${numberFormat(point.y ?? 0, {
                  maximumFractionDigits: 0,
                })}</strong>
              `;
            })
            .join('<br/>');

          return `
            <span style="font-size:10px">${dateLabel}</span>
            <br/>${pointLines}
          `;
        },
        shared: true,
      },
      xAxis: {
        className: 'stroke-0',
        type: 'datetime' as const,
      },
      yAxis: {
        className: 'stroke-0',
        labels: {
          formatter: function (
            this: Highcharts.AxisLabelsFormatterContextObject,
          ) {
            return numberFormat(this.value, {
              maximumFractionDigits: 1,
              notation: 'compact',
            });
          },
        },
        opposite: false,
        title: { text: 'Count' },
      },
    };

    return {
      chartOptions,
      seriesData: {
        transactions,
        uniqueIncoming,
        uniqueOutgoing,
      },
    };
  }, [data, height, locale]);

  return (
    <Chart chartConstructor="stockChart" options={chartOptions}>
      <Line.Series
        data={seriesData.uniqueOutgoing}
        options={{ name: 'Sent (Out)' }}
      />
      <Line.Series
        data={seriesData.uniqueIncoming}
        options={{ name: 'Receive (In)' }}
      />
    </Chart>
  );
});

NearChart.displayName = 'NearChart';
