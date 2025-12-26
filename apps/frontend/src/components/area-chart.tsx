'use client';

import { Chart } from '@highcharts/react';
import { Line } from '@highcharts/react/series';

export const AreaChart = () => {
  return (
    <Chart
      options={{
        chart: {
          backgroundColor: 'transparent',
          height: 120,
          styledMode: true,
        },
        legend: { enabled: false },
        xAxis: {
          className: 'stroke-0',
          labels: {
            step: 7,
          },
        },
        yAxis: {
          className: 'stroke-0',
          title: { text: undefined },
        },
      }}
    >
      <Line.Series data={[2, 1, 3, 1]} />
    </Chart>
  );
};
