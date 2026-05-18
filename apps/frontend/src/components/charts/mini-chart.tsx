'use client';

import { Chart, XAxis, YAxis } from '@highcharts/react';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { useMemo } from 'react';

type Props = {
  children: React.ReactNode;
  height?: number;
};

export const MiniChart = ({ children, height = 220 }: Props) => {
  const options = useMemo(
    () => ({
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
      exporting: { enabled: false },
      legend: { enabled: false },
      navigator: { enabled: false },
      plotOptions: {
        series: {
          marker: { enabled: false },
        },
      },
      rangeSelector: { enabled: false },
      scrollbar: { enabled: false },
    }),
    [height],
  );

  return (
    <Chart chartConstructor="stockChart" options={options}>
      <XAxis className="stroke-0" type="datetime" />
      <YAxis className="stroke-0" labels={{ enabled: false }} />
      {children}
    </Chart>
  );
};
