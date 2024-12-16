'use client';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useTheme } from 'next-themes';
import React, { useEffect, useMemo, useState } from 'react';

import { ChartStat } from '@/utils/types';

import Skeleton from '../skeleton/common/Skeleton';

interface Props {
  chartsData?: {
    charts: ChartStat[];
    status: number;
  };
  chartTypes?: string;
}

const MiniChart: React.FC<Props> = ({ chartsData, chartTypes }) => {
  const { theme } = useTheme();
  const [chartOptions, setChartOptions] = useState<Highcharts.Options | null>(
    null,
  );

  const data = chartsData?.charts as ChartStat[];

  const chartData = useMemo(() => {
    try {
      const chartTypeMappings = {
        'multi-chain-txns': (stat: ChartStat) => ({
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
  }, [data, chartTypes]);

  useEffect(() => {
    const createChartConfig = (): Highcharts.Options => ({
      accessibility: {
        enabled: false,
      },
      chart: {
        backgroundColor: 'transparent',
        height: 50,
        width: 180,
        zooming: {
          type: 'x',
        },
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
          data: chartData,
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
        type: 'datetime',
        visible: false,
      },
      yAxis: {
        visible: false,
      },
    });

    setChartOptions(createChartConfig());
  }, [chartData, chartTypes, theme]);

  return (
    <div>
      {chartTypes && (
        <div className="h-full" style={{ height: '50px', width: '180px' }}>
          {chartData?.length ? (
            chartOptions && (
              <HighchartsReact
                containerProps={{
                  style: {
                    backgroundColor: theme === 'dark' ? '#0D0D0D' : '#FFFFFF',
                    height: '100%',
                    width: '100%',
                  },
                }}
                highcharts={Highcharts}
                options={chartOptions}
              />
            )
          ) : (
            <Skeleton className="h-[70%] w-full" />
          )}
        </div>
      )}
    </div>
  );
};

export default MiniChart;
