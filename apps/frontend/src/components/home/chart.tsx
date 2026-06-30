'use client';

import { Chart } from '@highcharts/react';
import { Spline } from '@highcharts/react/series';
import { useMemo } from 'react';

import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, dateFormat, numberFormat } from '@/lib/format';

type Props = {
  data: { date: string; near_price: null | string; txns: null | number }[];
};

export const TxnsChart = ({ data }: Props) => {
  const { t } = useLocale('home');
  const network = useConfig((s) => s.config.network);
  const showPrice = network === 'mainnet';

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
        spacingBottom: 12,
        spacingLeft: 12,
        spacingRight: 24,
        spacingTop: 16,
        styledMode: true,
      },
      credits: { enabled: false },
      exporting: { enabled: false },
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
          const priceLine = showPrice
            ? `<br/>${t('chart.price')}: <strong>${currencyFormat(
                this.price,
              )}</strong>`
            : '';
          return `
          <span style="font-size:10px">${dateFormat(
            this.x,
            'MMM D, YYYY',
          )}</span>
          <br/>${t('chart.transactions')}: <strong>${numberFormat(this.y, {
            maximumFractionDigits: 0,
          })}</strong>${priceLine}
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
    [t, showPrice],
  );

  return (
    <Chart options={chartOptions}>
      <Spline.Series data={chartData} />
    </Chart>
  );
};
