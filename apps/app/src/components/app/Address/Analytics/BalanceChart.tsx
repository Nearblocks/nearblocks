'use client';
import React, { useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useParams } from 'next/navigation';
import { ChartStat } from '@/utils/types';
import { useTheme } from 'next-themes';

const BalanceChart = ({ chartsData }: { chartsData: ChartStat[] }) => {
  const [timeframe, setTimeframe] = useState('All');
  const param = useParams();
  const { theme } = useTheme();

  const filteredData = useMemo(() => {
    if (!chartsData?.length || timeframe === 'All') return chartsData;

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '1M':
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
        );
        break;
      case '6M':
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate(),
        );
        break;
      case '1Y':
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        );
        break;
      default:
        return chartsData;
    }

    return chartsData.filter((item) => new Date(item.date) >= startDate);
  }, [chartsData, timeframe]);

  const processChartData = () => {
    if (!filteredData.length)
      return { nearData: [], usdData: [], maxNear: 0, minNear: 0, maxUsd: 0 };

    const nearData = filteredData.map((item) => [
      new Date(item.date).getTime(),
      parseFloat(item.near_price) || 0,
    ]);

    const usdData = filteredData.map((item) => [
      new Date(item.date).getTime(),
      parseFloat(item.txn_volume_usd) || 0,
    ]);

    const nearPrices = filteredData.map(
      (item) => parseFloat(item.near_price) || 0,
    );
    const usdVolumes = filteredData.map(
      (item) => parseFloat(item.txn_volume_usd) || 0,
    );

    const maxNear = Math.max(...nearPrices);
    const minNear = Math.min(...nearPrices);
    const maxUsd = Math.max(...usdVolumes);

    return { nearData, usdData, maxNear, minNear, maxUsd };
  };

  const { nearData, usdData, maxNear, minNear, maxUsd } = processChartData();

  const chartOptions = {
    chart: {
      type: 'line',
      height: 400,
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Arial, sans-serif',
      },
      zoomType: 'x',
      panKey: 'shift',
      panning: {
        enabled: true,
        type: 'x',
      },
    },
    title: {
      text: '',
    },
    xAxis: {
      type: 'datetime',
      labels: {
        format: '{value:%b %d}',
        style: {
          fontSize: '11px',
          color: theme === 'dark' ? '#8b949e' : '#57606a',
        },
        step: 1,
      },
      gridLineWidth: 0,
      lineColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      tickColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      crosshair: {
        width: 1,
        color: theme === 'dark' ? '#374151' : '#e5e7eb',
        dashStyle: 'Dash',
      },
      minTickInterval: 24 * 3600 * 1000,
    },
    yAxis: [
      {
        title: {
          text: 'NEAR Balance',
          style: {
            color: theme === 'dark' ? '#8b949e' : '#57606a',
            fontSize: '12px',
            fontWeight: '500',
          },
        },
        labels: {
          format: '{value:.2f}',
          style: {
            color: theme === 'dark' ? '#8b949e' : '#57606a',
            fontSize: '11px',
          },
        },
        gridLineDashStyle: 'Dash',
        gridLineColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        lineColor: '#E5E7EB',
        min: 0,
        max: maxNear * 1.1,
      },
      {
        title: {
          text: 'USD Value',
          style: {
            color: theme === 'dark' ? '#8b949e' : '#57606a',
            fontSize: '12px',
            fontWeight: '500',
          },
        },
        labels: {
          format: '${value:,.0f}',
          style: {
            color: theme === 'dark' ? '#8b949e' : '#57606a',
            fontSize: '11px',
          },
        },
        opposite: true,
        gridLineWidth: 0,
        lineColor: '#E5E7EB',
        min: 0,
        max: maxUsd * 1.1,
      },
    ],
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      backgroundColor: 'transparent',
      borderWidth: 0,
      y: -20,
      itemStyle: {
        fontSize: '12px',
        color: theme === 'dark' ? '#8b949e' : '#57606a',
      },
      itemHoverStyle: {
        color: theme === 'dark' ? '#c9d1d9' : '#374151',
      },
      symbolWidth: 12,
      symbolHeight: 12,
      symbolRadius: 0,
    },
    tooltip: {
      shared: true,
      backgroundColor:
        theme === 'dark' ? 'rgba(40,40,40,0.95)' : 'rgba(255,255,255,0.95)',
      borderColor: theme === 'dark' ? '#30363d' : '#d1d9e0',
      borderRadius: 6,
      borderWidth: 1,
      shadow: {
        color: 'rgba(0, 0, 0, 0.1)',
        offsetX: 2,
        offsetY: 2,
        opacity: 0.3,
        width: 3,
      },
      style: {
        fontSize: '12px',
        color: theme === 'dark' ? '#8b949e' : '#57606a',
        fontWeight: '400',
      },
      useHTML: true,
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        const date = Highcharts.dateFormat('%b %d, %Y', this.x as number);
        let tooltip = `<div style="text-align: center; font-weight: 600; margin-bottom: 8px;">${date}</div>`;

        this?.points?.forEach((point: any) => {
          const color = point?.color;
          const seriesName = point?.series?.name;
          const squareIcon = `<span style="display: inline-block; width: 12px; height: 12px; background-color: ${color}; margin-right: 6px; vertical-align: middle;"></span>`;

          if (seriesName === 'Account NEAR Balance') {
            tooltip += `<div style="margin: 4px 0;">${squareIcon}Account NEAR Balance: <strong>${point.y.toFixed(
              2,
            )}</strong></div>`;
          } else {
            tooltip += `<div style="margin: 4px 0;">${squareIcon}Account USD Value: <strong>${point.y.toLocaleString()}</strong></div>`;
          }
        });
        return tooltip;
      },
      crosshairs: [
        {
          width: 1,
          color: '#9CA3AF',
          dashStyle: 'Dash',
        },
      ],
    },
    plotOptions: {
      line: {
        lineWidth: 2,
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true,
              radius: 5,
              lineWidth: 2,
              lineColor: '#ffffff',
            },
          },
        },
        states: {
          hover: {
            lineWidth: 1,
          },
        },
        connectNulls: false,
        step: false,
      },
    },
    series: [
      {
        name: 'Account NEAR Balance',
        data: nearData,
        color: '#3B82F6',
        yAxis: 0,
        lineWidth: 1,
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true,
              radius: 5,
              lineWidth: 1,
              lineColor: '#ffffff',
            },
          },
        },
      },
      {
        name: 'Account USD Value',
        data: usdData,
        color: '#EC4899',
        yAxis: 1,
        lineWidth: 1,
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true,
              radius: 5,
              lineWidth: 1,
              lineColor: '#ffffff',
            },
          },
        },
      },
    ],
    credits: {
      enabled: false,
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom',
            },
          },
        },
      ],
    },
  };

  const timeframeOptions = ['1M', '6M', '1Y', 'All'];

  return (
    <div className="w-full bg-white dark:bg-black-600 rounded-lg shadow-sm border border-gray-200 dark:border-black-200 my-2">
      <div className="flex justify-between items-center py-1.5 border-b border-gray-200 dark:border-black-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold dark:text-neargray-10 text-nearblue-600  px-4">
            Account NEAR Balance for {param?.id}
          </span>
          {maxNear > 0 && (
            <div className="bottom-16 left-8 bg-white dark:bg-black-300 border border-gray-300 dark:border-black-200 rounded px-2 py-1 text-xs shadow-sm z-10 dark:text-neargray-10">
              Highest NEAR Balance: ${maxNear.toFixed(2)}
            </div>
          )}
          {minNear >= 0 && (
            <div className="bottom-16 left-8 bg-white dark:bg-black-300 border border-gray-300 dark:border-black-200 rounded px-2 py-1 text-xs shadow-sm z-10 dark:text-neargray-10">
              Lowest NEAR Balance: ${minNear.toFixed(2)}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-black-300 p-1 rounded-lg mr-1">
          {timeframeOptions.map((option) => (
            <button
              key={option}
              onClick={() => setTimeframe(option)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors
        ${
          timeframe === option
            ? 'bg-white dark:bg-black-300 text-gray-700 dark:text-white border dark:border-black-200  '
            : 'bg-gray-100 dark:bg-black-200 text-gray-700 dark:text-neargray-10 hover:bg-gray-200 dark:hover:bg-black-100'
        }
      `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 dark:bg-black-300">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>

      <div className="px-4 pb-4">
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {filteredData?.length > 0 && (
            <>
              <span>
                {new Date(filteredData[0].date).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span>
                {new Date(
                  filteredData[Math.floor(filteredData.length * 0.25)].date,
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span>
                {new Date(
                  filteredData[Math.floor(filteredData.length * 0.5)].date,
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span>
                {new Date(
                  filteredData[Math.floor(filteredData.length * 0.75)].date,
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span>
                {new Date(
                  filteredData[filteredData.length - 1].date,
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceChart;
