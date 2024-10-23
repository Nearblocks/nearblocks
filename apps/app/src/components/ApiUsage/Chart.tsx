import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';
import dayjs from '../../utils/dayjs';
import withAuth from '@/stores/withAuth';
import useAuth from '@/hooks/useAuth';
import Plan from '../Icons/Plan';
import CircularLoader from '../skeleton/common/CircularLoader';
import { TooltipFormatterContextObject } from 'highcharts';

const ApiUsageChart = ({ keyId }: { keyId?: string | string[] }) => {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { data: chartData, loading: loadingChart } = useAuth(
    keyId ? `/key-usage/${keyId}` : '',
  );
  useEffect(() => {
    const isDarkTheme = theme === 'dark';
    if (!chartData) return;
    const chartOptions: any = {
      chart: {
        backgroundColor: isDarkTheme ? '#0d0d0d' : '#fff',
        height: 500,
        zoomType: 'x',
      },
      title: {
        text: 'Overview',
        style: {
          color: isDarkTheme ? '#FFFFFF' : '#000000',
        },
      },
      xAxis: {
        type: 'datetime',
        labels: {
          style: {
            color: isDarkTheme ? '#CCCCCC' : '#666666',
          },
        },
        lineColor: isDarkTheme ? '#666666' : '#cccccc',
        tickColor: isDarkTheme ? '#666666' : '#cccccc',
        gridLineColor: isDarkTheme ? '#444444' : '#E6E6E6',
      },
      yAxis: {
        title: {
          text: null,
          style: {
            color: isDarkTheme ? '#FFFFFF' : '#000000',
          },
        },
        labels: {
          style: {
            color: isDarkTheme ? '#CCCCCC' : '#666666',
          },
        },
        gridLineColor: isDarkTheme ? '#444444' : '#e6e6e6',
      },
      legend: {
        enabled: false,
        itemStyle: {
          color: isDarkTheme ? '#CCCCCC' : '#666666',
        },
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [
                0,
                isDarkTheme
                  ? 'rgba(30, 130, 133, 0.8)'
                  : 'rgba(3, 63, 64, 0.8)',
              ],
              [1, isDarkTheme ? 'rgba(3, 63, 64, 0.20)' : 'rgba(3, 63, 64, 0)'],
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
      tooltip: {
        shared: true,
        valueSuffix: '',
        formatter: function (this: TooltipFormatterContextObject) {
          let s = `<b>${dayjs(this.x).format('MM/DD/YYYY HH:mm')}</b>`;
          this?.points?.forEach(function (point) {
            s += `<br/><span style="color:${point.color}">\u25CF</span> ${point.series.name}: ${point.y}`;
          });
          return s;
        },
      },
      series: [
        {
          name: 'API Key Usage',
          type: 'area',
          data: chartData?.length > 0 ? chartData : [],
          color: isDarkTheme
            ? 'rgba(30, 130, 133, 0.8)'
            : 'rgba(3, 63, 64, 0.8)',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [
                0,
                isDarkTheme
                  ? 'rgba(30, 130, 133, 0.8)'
                  : 'rgba(3, 63, 64, 0.8)',
              ],
              [1, isDarkTheme ? 'rgba(3, 63, 64, 0.20)' : 'rgba(3, 63, 64, 0)'],
            ],
          },
        },
      ],
      credits: {
        enabled: false,
      },
      rangeSelector: {
        allButtonsEnabled: true,
        selected: 0,
        buttonTheme: {
          width: 60,
        },
      },
      exporting: {
        menuItemDefinitions: {
          embed: {
            onclick: function () {
              open;
            },
            text: 'Embed chart',
          },
        },
        buttons: {
          contextButton: {
            menuItems: [
              'viewFullscreen',
              'printChart',
              'separator',
              'downloadPNG',
              'downloadJPEG',
              'downloadPDF',
              'downloadSVG',
              'separator',
              'embed',
            ],
            theme: {
              fill: isDarkTheme ? '#444444' : '#FFFFFF', // Button background
              style: {
                color: isDarkTheme ? '#FFFFFF' : '#000000', // Text color
              },
              states: {
                hover: {
                  fill: isDarkTheme ? '#555555' : '#E6E6E6', // Hover background
                  style: {
                    color: isDarkTheme ? '#FFFFFF' : '#000000', // Hover text color
                  },
                },
                select: {
                  fill: isDarkTheme ? '#333333' : '#E6E6E6', // Select background
                  style: {
                    color: isDarkTheme ? '#FFFFFF' : '#000000', // Select text color
                  },
                },
              },
            },
          },
        },
      },
    };
    const wrapper = document.getElementById('chart-wrapper');
    if (wrapper) {
      chartOptions.chart.height = wrapper.offsetWidth;
      chartOptions.chart.height = wrapper.offsetHeight;
    }
    setOptions(chartOptions);
    setLoading(false);
  }, [chartData, theme]);

  if (loading) {
    return (
      <div className="h-1/2 flex items-center justify-center py-48">
        <CircularLoader />
      </div>
    );
  }

  if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
  }

  return (
    <>
      {loadingChart ? (
        <div className="h-1/2 flex items-center justify-center py-48">
          <CircularLoader />
        </div>
      ) : chartData?.length > 0 ? (
        <div className="pl-2 pr-4 py-6">
          <div>
            <HighchartsReact
              highcharts={Highcharts}
              options={options}
              constructorType={'stockChart'}
              className="highcharts-dark"
            />
          </div>
        </div>
      ) : (
        <div className="w-full bg-white dark:bg-black-600 dark:text-neargray-10 rounded-xl soft-shadow h-fit">
          <div className="text-center py-28">
            <div className="mb-4 flex justify-center">
              <span className="inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-500 rounded-full p-4">
                <Plan />
              </span>
            </div>
            <h3 className="h-5 font-bold text-lg text-black dark:text-neargray-10">
              API Key Usage
            </h3>
            <p className="mb-0 py-4 font-bold text-sm text-gray-500 dark:text-neargray-50">
              No API key usage over time
            </p>
          </div>
        </div>
      )}
    </>
  );
};
export default withAuth(ApiUsageChart);
