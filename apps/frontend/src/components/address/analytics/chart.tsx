'use client';

import { Chart } from '@highcharts/react';
import 'highcharts/esm/modules/exporting.src.js';
import 'highcharts/esm/modules/stock.src.js';
import { useMemo } from 'react';

type Props = {
  children: React.ReactNode;
  // Number of --highcharts-color-N / .highcharts-color-N slots (defined in
  // globals.css) Highcharts should cycle through before repeating a color.
  // Only needs raising above the Highcharts default (10) for charts with
  // more categories than that — keeping colors and the legend in sync
  // relies on this native mechanism rather than per-series overrides.
  colorCount?: number;
  height?: number;
  showRangeSelector?: boolean;
};

export const AnalyticsChart = ({
  children,
  colorCount,
  height = 420,
  showRangeSelector = true,
}: Props) => {
  const options = useMemo(() => {
    const options = {
      chart: {
        backgroundColor: 'transparent',
        ...(colorCount ? { colorCount } : {}),
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
      rangeSelector: showRangeSelector
        ? {
            allButtonsEnabled: true,
            buttonPosition: {
              align: 'right' as const,
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
          }
        : { enabled: false },
      scrollbar: { enabled: false },
    };

    return options;
  }, [colorCount, height, showRangeSelector]);

  return (
    <Chart chartConstructor="stockChart" options={options}>
      {children}
    </Chart>
  );
};
