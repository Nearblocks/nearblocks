'use client';
import { TooltipFormatterContextObject } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';
import HighchartsExporting from 'highcharts/modules/exporting';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import UserLayout from '@/components/app/Layouts/UserLayout';
import useAuth from '@/hooks/app/useAuth';
import dayjs from '@/utils/app/dayjs';
import Plan from '../Icons/Plan';
import CircularLoader from '../skeleton/common/CircularLoader';
import withAuth from '../stores/withAuth';
import { localFormat } from '@/utils/libs';
import { shortenAddress } from '@/utils/app/libs';

interface Props {
  keyId?: string | string[];
  role?: string;
}
const ApiUsageChart = ({ keyId, role }: Props) => {
  const [options, setOptions] = useState(null);
  const { theme } = useTheme();
  const apiUrl = role === 'publisher' && keyId ? `keys/${keyId}/stats` : '';
  const { data: keyData, loading: keyDataLoading } = useAuth(apiUrl);
  const chartapiUrl = keyId ? `/keys/${keyId}/chart` : '';
  const { data: chartData, loading: loadingChart } = useAuth(chartapiUrl);

  useEffect(() => {
    const isDarkTheme = theme === 'dark';
    if (!chartData) return;
    const chartOptions: any = {
      chart: {
        backgroundColor: isDarkTheme ? '#0d0d0d' : '#fff',
        height: 500,
        zoomType: 'x',
      },
      credits: {
        enabled: false,
      },
      exporting: {
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
              style: {
                color: isDarkTheme ? '#FFFFFF' : '#000000', // Text color
              },
            },
          },
        },
        menuItemDefinitions: {
          embed: {
            onclick: function () {
              open;
            },
            text: 'Embed chart',
          },
        },
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
              x2: 0,
              y1: 0,
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
      },
      rangeSelector: {
        allButtonsEnabled: true,
        buttonTheme: {
          width: 60,
        },
        selected: 0,
      },
      series: [
        {
          color: isDarkTheme
            ? 'rgba(30, 130, 133, 0.8)'
            : 'rgba(3, 63, 64, 0.8)',
          data: chartData?.length > 0 ? chartData : [],
          fillColor: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
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
          name: 'API Key Usage',
          type: 'area',
        },
      ],
      title: {
        style: {
          color: isDarkTheme ? '#FFFFFF' : '#000000',
        },
        text: 'Overview',
      },
      tooltip: {
        formatter: function (this: TooltipFormatterContextObject) {
          let s = `<b>${dayjs(this.x).format('MM/DD/YYYY HH:mm')}</b>`;
          this?.points?.forEach(function (point) {
            s += `<br/><span style="color:${point.color}">\u25CF</span> ${point.series.name}: ${point.y}`;
          });
          return s;
        },
        shared: true,
        valueSuffix: '',
      },
      xAxis: {
        gridLineColor: isDarkTheme ? '#444444' : '#E6E6E6',
        labels: {
          style: {
            color: isDarkTheme ? '#CCCCCC' : '#666666',
          },
        },
        lineColor: isDarkTheme ? '#666666' : '#cccccc',
        tickColor: isDarkTheme ? '#666666' : '#cccccc',
        type: 'datetime',
      },
      yAxis: {
        gridLineColor: isDarkTheme ? '#444444' : '#e6e6e6',
        labels: {
          style: {
            color: isDarkTheme ? '#CCCCCC' : '#666666',
          },
        },
        title: {
          style: {
            color: isDarkTheme ? '#FFFFFF' : '#000000',
          },
          text: null,
        },
      },
    };
    const wrapper = document.getElementById('chart-wrapper');
    if (wrapper) {
      chartOptions.chart.height = wrapper.offsetWidth;
      chartOptions.chart.height = wrapper.offsetHeight;
    }
    setOptions(chartOptions);
  }, [chartData, theme]);

  if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
  }

  const content = (
    <div>
      <div className="container-xxl mx-auto">
        {loadingChart ? (
          <div className="h-1/2 flex items-center justify-center py-48">
            <CircularLoader />
          </div>
        ) : chartData?.length > 0 ? (
          <div className="pl-2 pr-4 py-6 bg-white dark:bg-black-600 rounded-lg">
            {role === 'publisher' && (
              <div className="flex justify-between -mt-2 text-gray-500 p-2 flex-wrap md:flex-nowrap lg:flex-wrap xl:flex-nowrap dark:text-neargray-10 text-sm">
                {!keyDataLoading && keyData && (
                  <div className="flex items-center flex-wrap md:flex-nowrap lg:flex-wrap xl:flex-nowrap">
                    <span className="whitespace-nowrap">Total Key Usage:</span>
                    <span className="ml-0.5 font-semibold">
                      {localFormat((keyData?.consumed).toString())}
                    </span>
                  </div>
                )}
                {!keyDataLoading && keyData && (
                  <div className="flex items-center flex-wrap md:flex-nowrap lg:flex-wrap xl:flex-nowrap">
                    <span className="whitespace-nowrap">API Key:</span>
                    <span>
                      <span className="ml-0.5 font-semibold">
                        {shortenAddress(keyData?.key?.token)}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )}
            <div>
              <HighchartsReact
                className="highcharts-dark"
                constructorType={'stockChart'}
                highcharts={Highcharts}
                options={options}
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
              <h3 className="h-5 font-semibold text-lg text-nearblue-600 dark:text-neargray-10">
                API Key Usage
              </h3>
              <p className="mb-0 py-4 font-semibold text-sm text-gray-500 dark:text-neargray-50">
                No API key usage over time
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  return (
    <>
      {role === 'publisher' ? (
        <UserLayout role={role} title="Api Key Usage">
          <div className="block bg-white dark:bg-black-600 border soft-shadow rounded-xl overflow-hidden mb-10">
            {content}
          </div>
        </UserLayout>
      ) : (
        content
      )}
    </>
  );
};
export default withAuth(ApiUsageChart);
