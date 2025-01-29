'use client';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import { Link } from '@/i18n/routing';
import { chartDataInfo } from '@/utils/types';

import Tooltip from '../common/Tooltip';
import Question from '../Icons/Question';
import Skeleton from '../skeleton/common/Skeleton';
import SwitchButton from '../SwitchButton';

interface Props {
  chartTypes: string;
  data?: {
    charts: chartDataInfo[];
    status: number;
  };
  poweredBy?: boolean;
  theme: string;
}

const TpsChart: React.FC<Props> = ({
  chartTypes,
  data,
  theme: cookieTheme,
}) => {
  let { theme } = useTheme();
  const t = useTranslations();
  const { networkId } = useConfig();

  const [chartTpsData, setChartTpsData] = useState<any[]>([]);
  const [logView, setLogView] = useState(false);
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({});

  if (theme == undefined) {
    theme = cookieTheme;
  }

  const handleToggle = () => {
    setLogView((prevState) => !prevState);
  };
  const charts = [
    {
      exclude: `${networkId}` === 'testnet',
      image: `/images/charts/near-price.svg`,
      image_dark: `/images/charts/near-price_dark.svg`,
      link: '/charts/near-price',
      text: t ? t('charts.nearPrice.heading') : 'Near Daily Price (USD) Chart',
    },
    {
      exclude: `${networkId}` === 'testnet',
      image: `/images/charts/market-cap.svg`,
      image_dark: `/images/charts/market-cap_dark.svg`,
      link: '/charts/market-cap',
      text: t
        ? t('marketCapCharts.heading')
        : 'Near Market Capitalization Chart',
    },
    {
      exclude: false,
      image: `/images/charts/near-supply.svg`,
      image_dark: `/images/charts/near-supply_dark.svg`,
      link: '/charts/near-supply',
      text: t ? t('nearSupplyCharts.heading') : 'Near Supply Growth Chart',
    },
    {
      exclude: false,
      image: `/images/charts/txns.svg`,
      image_dark: `/images/charts/txns_dark.svg`,
      link: '/charts/txns',
      text: t ? t('txnsCharts.heading') : 'Near Daily Transactions Chart',
    },
    {
      exclude: false,
      image: `/images/charts/blocks.svg`,
      image_dark: `/images/charts/blocks_dark.svg`,
      link: '/charts/blocks',
      text: t ? t('blocksCharts.heading') : 'New Blocks',
    },
    {
      exclude: false,
      image: `/images/charts/addresses.svg`,
      image_dark: `/images/charts/addresses_dark.svg`,
      link: '/charts/addresses',
      text: t ? t('addressesCharts.heading') : 'Near Unique Accounts Chart',
    },
    {
      exclude: `${networkId}` === 'testnet',
      image: `/images/charts/txn-fee.svg`,
      image_dark: `/images/charts/txn-fee_dark.svg`,
      link: '/charts/txn-fee',
      text: t ? t('txnFeeCharts.heading') : 'Transaction Fee Chart',
    },
    {
      exclude: `${networkId}` === 'testnet',
      image: `/images/charts/txn-volume.svg`,
      image_dark: `/images/charts/txn-volume_dark.svg`,
      link: '/charts/txn-volume',
      text: t ? t('txnVolumeCharts.heading') : 'Transaction Volume Chart',
    },
    {
      exclude: false,
      image: `/images/charts/tps.svg`,
      image_dark: `/images/charts/tps_dark.svg`,
      link: '/charts/tps',
      text: 'Near Transactions per Second Chart',
    },
    {
      exclude: false,
      image: `/images/charts/multi-chain-txns.svg`,
      image_dark: `/images/charts/multi-chain-txns_dark.svg`,
      link: '/charts/multi-chain-txns',
      text: t ? t('multichainTxns.heading') : 'Multi Chain Transactions Chart',
    },
  ];

  useEffect(() => {
    if (data) {
      const seriesByShard: { [shard: number]: any[] } = {};
      let totalTransactions: any[] = [];

      data.charts.forEach((dataPoint: chartDataInfo) => {
        let totalTxns = 0;
        dataPoint?.shards?.forEach((shard: any) => {
          if (!seriesByShard[shard.shard]) {
            seriesByShard[shard.shard] = [];
          }
          seriesByShard[shard.shard].push([
            new Date(parseInt(dataPoint.date) * 1000).valueOf(),
            shard.txns,
          ]);
          totalTxns += shard.txns;
        });

        totalTransactions.push([
          new Date(parseInt(dataPoint.date) * 1000).valueOf(),
          totalTxns,
        ]);
      });

      const series: Highcharts.SeriesOptionsType[] = Object.keys(
        seriesByShard,
      ).map((shard) => ({
        data: seriesByShard[parseInt(shard)].reverse(),
        name: `Shard ${shard}`,
        type: 'line',
      }));

      series.push({
        data: totalTransactions.reverse(),
        name: 'Total Transactions',
        type: 'line',
      });

      const baseOptions: Highcharts.Options = {
        accessibility: {
          enabled: false,
        },
        boost: {
          useGPUTranslations: true,
        },
        chart: {
          backgroundColor: 'transparent',
          height: 350,
          panKey: 'shift',
          zooming: {
            type: 'x',
          },
        },
        credits: {
          enabled: false,
        },
        legend: {
          align: 'right',
          itemHoverStyle: {
            color: theme === 'dark' ? '#e0e0e0' : '#333333',
          },
          itemStyle: {
            color: theme === 'dark' ? '#e0e0e0' : '#333333',
          },
          layout: 'vertical',
          verticalAlign: 'middle',
        },
        plotOptions: {
          series: {
            label: {
              connectorAllowed: false,
            },
          },
        },
        series: series,
        subtitle: {
          text: 'Source: NearBlocks.io',
        },
        title: {
          style: {
            color: theme === 'dark' ? '#e0e0e0' : '#333333',
          },
          text: 'Near Transactions per Second Chart',
        },
        tooltip: {
          headerFormat:
            '<span style="color: rgb(51, 51, 51); font-size: 0.8em; fill: rgb(51, 51, 51);">{point.key:%A, %e %b %Y, %H:%M:%S}</span><br/>',
          valueDecimals: 2,
        },
        xAxis: {
          labels: {
            style: {
              color: theme === 'dark' ? '#e0e0e0' : '#333333',
            },
          },
          lineColor: theme === 'dark' ? '#e0e0e0' : '#333333',
          type: 'datetime',
        },
        yAxis: {
          gridLineColor: theme === 'dark' ? '#1F2228' : '#e6e6e6',
          labels: {
            style: {
              color: theme === 'dark' ? '#e0e0e0' : '#333333',
            },
          },
          lineColor: theme === 'dark' ? '#e0e0e0' : '#333333',
          title: {
            text: 'Transactions per Second',
          },
          type: logView ? 'logarithmic' : 'linear',
        },
      };

      setChartTpsData(series);
      setChartOptions(baseOptions);
    }
  }, [data, theme, logView]);

  return (
    <div>
      {chartTypes && (
        <>
          <div
            className="block bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden mb-10"
            style={{ height: 580 }}
          >
            <div className="border-b dark:border-black-200 flex justify-between items-center">
              {chartTpsData?.length > 0 ? (
                <div className="w-full flex flex-col sm:!flex-row sm:justify-between py-2 items-end sm:!py-0 sm:items-center">
                  <p className="leading-7 px-4 text-sm py-4 text-nearblue-600 dark:text-neargray-10">
                    Near Transactions per Second Chart shows the transactions
                    occuring per second on Near blockchain.
                  </p>
                  <div className="flex items-center text-nearblue-600 dark:text-neargray-10">
                    <Tooltip
                      className={'left-1/2 max-w-[200px] w-40'}
                      position="bottom"
                      tooltip="Toggle between Log View and Normal View. Log View uses logarithmic scale."
                    >
                      <span>
                        <Question className="w-4 h-4 fill-current mr-2" />
                      </span>
                    </Tooltip>
                    <div className="w-8 flex">
                      <SwitchButton
                        onChange={handleToggle}
                        selected={logView}
                      />
                    </div>
                    <label className="text-nearblue-600 dark:text-neargray-10 text-sm leading-none pr-[15px] px-2">
                      {'Log View'}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="py-5 mt-1 ml-4">
                  <Skeleton className="w-80 h-4" />
                </div>
              )}
            </div>
            <div className="pl-2 pr-2 py-8 h-full">
              {chartTpsData && chartTpsData?.length ? (
                <HighchartsReact
                  containerProps={{
                    style: {
                      height: '100%',
                      width: '100%',
                    },
                  }}
                  highcharts={Highcharts}
                  options={chartOptions}
                />
              ) : (
                <Skeleton className="h-[93%] w-full" />
              )}
            </div>
          </div>
          <h2 className="mb-4 px-2 text-lg text-gray-700 dark:text-neargray-10">
            {t('charts.otherHeading')}
          </h2>
        </>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {charts?.map(
          (chart, index) =>
            chart?.exclude === false && (
              <div
                className="block bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden"
                key={index}
              >
                <Link
                  className="block leading-7 p-3 text-sm text-nearblue-600 dark:text-neargray-10 border-b dark:border-black-200 truncate"
                  href={chart?.link}
                >
                  <h2>{chart?.text}</h2>
                </Link>
                <div className="pl-2 pr-4 py-6">
                  <Link href={chart?.link}>
                    <Image
                      alt={chart?.text}
                      height={550}
                      loading="eager"
                      src={theme === 'dark' ? chart?.image_dark : chart?.image}
                      width={600}
                    />
                  </Link>
                </div>
              </div>
            ),
        )}
      </div>
    </div>
  );
};

export default TpsChart;
