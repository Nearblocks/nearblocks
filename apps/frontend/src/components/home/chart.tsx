'use client';

import { Chart } from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import { useMemo } from 'react';

import { DailyStatsRes } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, dateFormat, numberFormat } from '@/lib/format';

type Props = {
  data: NonNullable<DailyStatsRes['data']>;
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

  return (
    <Chart
      options={{
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
          formatter: function () {
            const point = this as Highcharts.Point & {
              price: number;
            };

            return `
              <span style="font-size:10px">${dateFormat(locale, point.x, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}</span>
              <br/>${t('chart.transactions')}: <strong>${numberFormat(point.y, {
                maximumFractionDigits: 0,
              })}</strong>
              <br/>${t('chart.price')}: <strong>${currencyFormat(
                point.price,
              )}</strong>
            `;
          },
        },
        xAxis: {
          className: 'stroke-0',
          labels: {
            step: 3,
          },
          type: 'datetime',
        },
        yAxis: {
          className: 'stroke-0',
          labels: {
            formatter: function () {
              const v = this.value as number;

              return numberFormat(v, {
                maximumFractionDigits: 1,
                notation: 'compact',
              });
            },
          },
          title: { text: undefined },
        },
      }}
    >
      <Line.Series data={chartData} />
    </Chart>
  );
};
