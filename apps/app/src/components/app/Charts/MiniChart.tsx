'use client';

import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';

import { ChartConfig, ChartStat } from '@/utils/types';

import Skeleton from '../skeleton/common/Skeleton';

interface Props {
  chartsData?: {
    charts: ChartStat[];
    status: number;
  };
  chartTypes?: string;
}

const MiniChart = (props: Props) => {
  const { chartsData, chartTypes } = props;
  const { theme } = useTheme();
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);

  const data = chartsData?.charts as ChartStat[];

  const chartData = useMemo(() => {
    try {
      const chartTypeMappings = {
        'multi-chain-txns': (stat: ChartStat) => ({
          date: stat.date,
          multiChainTxns: stat.multichain_txns,
          x: new Date(stat.date).valueOf(),
          y: Number(stat.multichain_txns),
        }),
      };

      const mappingFunction =
        chartTypeMappings[chartTypes as keyof typeof chartTypeMappings];
      if (mappingFunction) {
        return data.map(mappingFunction);
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chartTypes]);

  useEffect(() => {
    const fetchData = () => {
      const fetchedData = {
        accessibility: {
          enabled: false,
        },
        chart: {
          backgroundColor: 'transparent',
          height: 50,
          width: 180,
          zoomType: 'x',
        },
        credits: {
          enabled: false,
        },
        exporting: {
          enabled: false,
        },
        legend: {
          enabled: false,
        },
        plotOptions: {
          area: {
            fillColor: {
              linearGradient: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 1,
              },
              stops: [
                [0, 'rgba(3, 63, 64, 0.8)'],
                [1, 'rgba(3, 63, 64, 0)'],
              ],
            },
            lineWidth: 1,
            marker: {
              enabled: false,
            },
            states: {
              hover: {
                lineWidth: 1,
              },
            },
            threshold: null,
            turboThreshold: 3650,
          },
          series: {
            connectNulls: false,
          },
        },
        series: [
          {
            color: 'rgba(3, 63, 64, 1)',
            enableMouseTracking: false,
            type: 'area',
          },
        ],
        subtitle: {
          text: '',
        },
        title: {
          text: '',
        },
        xAxis: {
          visible: false,
        },
        yAxis: {
          visible: false,
        },
      };
      setChartConfig(fetchedData);
    };

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, chartTypes, theme]);

  const iframeSrc = chartConfig
    ? `
    <html>
      <head>
        <script src="https://code.highcharts.com/highcharts.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.10.4"></script>
        <script src="https://cdn.jsdelivr.net/npm/numeral@2.0.6/numeral.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/big.js@5.2.2"></script>
        <script src="https://code.highcharts.com/modules/accessibility.js"></script>
      <style>
        body {
          background-color: ${theme === 'dark' ? '#0d0d0d' : '#ffffff'};
          margin: 0;
          padding: 0;
        }
        html{
  
          background-color: ${theme === 'dark' ? '#0d0d0d' : '#ffffff'};
        }
      </style>
      </head>
      <body >
        <div id="chart-container" style="width: 100%; height: 100%;"></div>
        <script type="text/javascript">
          const chartConfig = ${JSON.stringify(chartConfig)};
           chartConfig.series[0].data = ${JSON.stringify(chartData)};
          Highcharts.chart('chart-container', chartConfig);
        </script>
      </body>
    </html>
  `
    : ``;

  return (
    <div>
      {chartTypes && (
        <div className="h-full" style={{ height: '50px', width: '180px' }}>
          {chartData?.length ? (
            <iframe
              srcDoc={iframeSrc}
              style={{
                backgroundColor: theme === 'dark' ? '#0D0D0D' : '#FFFF',
                border: 'none',
                height: '100%',
                overflow: 'hidden',
                width: '100%',
              }}
            />
          ) : (
            <Skeleton className="h-[70%] w-full" />
          )}
        </div>
      )}
    </div>
  );
};
export default MiniChart;
