import { useEffect, useMemo, useState } from 'react';
import { ChartConfig, ChartStat } from '@/utils/types';
import { useTheme } from 'next-themes';
import Skeleton from '../skeleton/common/Skeleton';

interface Props {
  chartTypes?: string;
  chartsData?: {
    charts: ChartStat[];
    status: number;
  };
}

const MiniChart = (props: Props) => {
  const { chartTypes, chartsData } = props;
  const { theme } = useTheme();
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);

  const data = chartsData?.charts as ChartStat[];

  const chartData = useMemo(() => {
    try {
      const chartTypeMappings = {
        'multi-chain-txns': (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.multichain_txns),
          date: stat.date,
          multiChainTxns: stat.multichain_txns,
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
        chart: {
          height: 50,
          width: 180,
          zoomType: 'x',
          backgroundColor: 'transparent',
        },
        accessibility: {
          enabled: false,
        },
        title: {
          text: '',
        },
        subtitle: {
          text: '',
        },
        xAxis: {
          visible: false,
        },
        yAxis: {
          visible: false,
        },
        legend: {
          enabled: false,
        },
        series: [
          {
            type: 'area',
            color: 'rgba(3, 63, 64, 1)',
            enableMouseTracking: false,
          },
        ],
        credits: {
          enabled: false,
        },
        plotOptions: {
          series: {
            connectNulls: false,
          },
          area: {
            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1,
              },
              stops: [
                [0, 'rgba(3, 63, 64, 0.8)'],
                [1, 'rgba(3, 63, 64, 0)'],
              ],
            },
            marker: {
              enabled: false,
            },
            lineWidth: 1,
            states: {
              hover: {
                lineWidth: 1,
              },
            },
            threshold: null,
            turboThreshold: 3650,
          },
        },
        exporting: {
          enabled: false,
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
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: theme === 'dark' ? '#0D0D0D' : '#FFFF',
                overflow: 'hidden',
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
