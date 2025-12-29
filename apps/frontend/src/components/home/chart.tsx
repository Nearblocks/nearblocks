'use client';

import { Chart } from '@highcharts/react';
import { Line } from '@highcharts/react/series';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import { DailyStats } from 'nb-schemas';

import { currencyFormat, numberFormat } from '@/lib/format';

type Props = {
  data: DailyStats[];
};

export const TxnsChart = ({ data }: Props) => {
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
          height: 120,
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
              <span style="font-size:10px">${dayjs(point.x).format(
                'MMMM DD, YYYY',
              )}</span>
              <br/>Transactions: <strong>${numberFormat(point.y, {
                maximumFractionDigits: 0,
              })}</strong>
              <br/>Price: <strong>${currencyFormat(point.price)}</strong>
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

              if (v >= 1_000_000) {
                return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
              }

              if (v >= 1_000) {
                return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
              }

              return v.toString();
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
