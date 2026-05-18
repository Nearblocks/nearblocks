'use client';

import { Chart } from '@highcharts/react';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { useMemo } from 'react';

type Props = {
  children: React.ReactNode;
  height?: number;
};

export const AnalyticsChart = ({ children, height = 420 }: Props) => {
  const options = useMemo(() => {
    const options = {
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
      exporting: { enabled: true },
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
        allButtonsEnabled: true,
        buttonPosition: {
          // align: 'right' as const,
          x: -20,
          y: -4,
        },
        buttonSpacing: 8,
        buttonTheme: {
          height: 28,
          padding: 0,
          r: 8,
          width: 32,
        },
        floating: false,
        inputEnabled: false,
      },
      scrollbar: { enabled: false },
    };

    return options;
  }, [height]);

  return (
    <Chart chartConstructor="stockChart" options={options}>
      {children}
    </Chart>
  );
};
