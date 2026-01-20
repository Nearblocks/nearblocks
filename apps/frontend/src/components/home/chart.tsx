'use client';

import { Chart } from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import { useMemo } from 'react';

import { DailyStats } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, dateFormat, numberFormat } from '@/lib/format';

type Props = {
  data: DailyStats[];
};

export const TxnsChart = ({ data }: Props) => {
  const { locale, t } = useLocale('home');

  const chartData = useMemo(() => {
    return data
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        price: Number(item.near_price),
        x: new Date(item.date),
        y: Number(item.txns),
      }));
  }, [data]);
  const chartOptions = useMemo(
    () => ({
      chart: {
        backgroundColor: 'transparent',
        height: 115,
        spacingBottom: 0,
        spacingLeft: 0,
        spacingRight: 10,
        spacingTop: 10,
        styledMode: true,
      },
      credits: { enabled: false },
      legend: { enabled: false },
      plotOptions: {
        series: {
          marker: { enabled: false },
        },
      },
      tooltip: {
        formatter: function (
          this: Highcharts.Point & {
            price?: number;
          },
        ) {
          return `
          <span style="font-size:10px">${dateFormat(locale, this.x, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}</span>
          <br/>${t('chart.transactions')}: <strong>${numberFormat(this.y, {
            maximumFractionDigits: 0,
          })}</strong>
          <br/>${t('chart.price')}: <strong>${currencyFormat(
            this.price,
          )}</strong>
        `;
        },
      },
      xAxis: {
        className: 'stroke-0',
        labels: {
          step: 3,
        },
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
        title: { text: undefined },
      },
    }),
    [locale, t],
  );

  return (
    <Chart options={chartOptions}>
      <Line.Series data={chartData} />
    </Chart>
  );
};
