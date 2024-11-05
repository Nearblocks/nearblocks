'use client';
import {
  currency,
  dollarFormat,
  formatCustomDate,
  localFormat,
} from '@/utils/libs';
import Skeleton from '../skeleton/common/Skeleton';
import { gasPrice } from '@/utils/near';
import { useEffect, useMemo, useState } from 'react';
import { ChartConfigType, ChartInfo, StatusInfo } from '@/utils/types';
import { Tooltip } from '@reach/tooltip';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useConfig } from '@/hooks/app/useConfig';
import Cookies from 'js-cookie';

interface Props {
  stats: StatusInfo;
  chartsDetails: { charts: ChartInfo[] };
  error: boolean;
}

const Overview = ({ stats, chartsDetails, error }: Props) => {
  const t = useTranslations();
  const theme = Cookies?.get('theme') || 'light';
  const [mounted, setMounted] = useState(false);
  const [chartConfig, setChartConfig] = useState<ChartConfigType>(null);
  const { networkId } = useConfig();

  const LoadingSkeleton = () => {
    return (
      <div className="container mx-auto px-3">
        <div className="bg-white soft-shadow rounded-xl overflow-hidden px-5 md:py lg:px-0 dark:bg-black-600">
          <div
            className={`grid grid-flow-col grid-cols-1 ${
              networkId === 'mainnet'
                ? 'grid-rows-3 lg:grid-cols-3'
                : 'grid-rows-2 lg:grid-cols-2'
            } lg:grid-rows-1 divide-y lg:divide-y-0 lg:divide-x lg:py-3 dark:divide-black-200`}
          >
            {networkId === 'mainnet' && (
              <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:pb-0 md:px-5">
                <div className="flex flex-row py-4 lg:pb-4 lg:px-0">
                  <div className="items-center flex justify-left mr-3">
                    <Skeleton className="w-6 h-6 rounded-full" />
                  </div>
                  <div className="ml-2 flex-1">
                    <Skeleton className="h-3.5 w-24 mb-1.5" />
                    <Skeleton className="h-5 w-full max-w-[200px]" />
                  </div>
                </div>
                <div className="flex flex-row py-4 lg:pt-4 lg:px-0">
                  <div className="items-center flex justify-left mr-3">
                    <Skeleton className="w-6 h-6 rounded-full" />
                  </div>
                  <div className="ml-2 flex-1">
                    <Skeleton className="h-3.5 w-24 mb-1.5" />
                    <Skeleton className="h-5 w-full max-w-[180px]" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:pb-0 md:px-5">
              <div className="flex flex-row justify-between py-4 lg:pb-4 lg:px-0">
                <div className="flex flex-row">
                  <div className="items-center flex justify-left mr-3">
                    <Skeleton className="w-6 h-6 rounded-full" />
                  </div>
                  <div className="ml-2">
                    <Skeleton className="h-3.5 w-24 mb-1.5" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <Skeleton className="h-3.5 w-24 mb-1.5" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <div className="flex flex-row justify-between py-4 lg:pt-4 lg:px-0">
                <div className="flex flex-row">
                  <div className="items-center flex justify-left mr-3">
                    <Skeleton className="w-6 h-6 rounded-full" />
                  </div>
                  <div className="ml-2">
                    <Skeleton className="h-3.5 w-32 mb-1.5" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <Skeleton className="h-3.5 w-28 mb-1.5" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-1 flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:px-5">
              <div className="flex-1 py-4 lg:px-0">
                <Skeleton className="h-3.5 w-48 mb-3" />
                <Skeleton className="h-28 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const charts = chartsDetails?.charts;

  useEffect(() => {
    setMounted(true);
  }, []);
  const chartData = useMemo(() => {
    try {
      const series = charts?.map((stat: any) => ({
        y: Number(stat.txns),
        date: stat.date,
        price: stat.near_price,
      }));
      series.sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const categories = series.map((stat: any) => formatCustomDate(stat.date));
      return {
        series,
        categories,
      };
    } catch (error) {
      return {
        series: [],
        categories: [],
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charts]);

  useEffect(() => {
    if (!mounted) return;

    function fetchData() {
      const fetchedData = {
        chart: {
          height: 110,
          spacingTop: 10,
          spacingBottom: 0,
          spacingLeft: 0,
          spacingRight: 10,
          backgroundColor: 'transparent',
        },
        accessibility: {
          enabled: false,
        },
        title: {
          text: null,
        },
        xAxis: {
          type: 'datetime',
          lineWidth: 0,
          tickLength: 0,
          labels: {
            step: 7,
            style: {
              color: theme === 'dark' ? '#e0e0e0' : '#333333',
            },
          },
          categories: chartData.categories,
        },
        yAxis: {
          gridLineWidth: 0,
          title: {
            text: null,
          },
          labels: {
            style: {
              color: theme === 'dark' ? '#e0e0e0' : '#333333',
            },
          },
        },
        legend: {
          enabled: false,
        },
        plotOptions: {
          spline: {
            lineWidth: 1,
            states: {
              hover: {
                lineWidth: 1,
              },
            },
            marker: {
              radius: 0,
            },
          },
        },
        series: [
          {
            type: 'spline',
            data: chartData.series,
            color: '#80D1BF',
          },
        ],
        exporting: {
          enabled: false,
        },
        credits: {
          enabled: false,
        },
      };
      setChartConfig(fetchedData);
    }

    fetchData();
  }, [chartData, theme, mounted]);

  const iframeSrc = chartConfig
    ? `
    <html>
      <head>
      <style>
      body, html{
        background-color: ${theme === 'dark' ? '#0D0D0D' : '#ffff'};
      }
      </style>
        <script src="https://code.highcharts.com/highcharts.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dayjs@1.10.4"></script>
        <script src="https://cdn.jsdelivr.net/npm/numeral@2.0.6/numeral.min.js"></script>
        <script src="https://code.highcharts.com/modules/accessibility.js"></script>
      </head>
      <body>
        <div id="chart-container" style="width: 100%; height: 100%;"></div>
        <script type="text/javascript">
          const chartConfig = ${JSON.stringify(chartConfig)};
          chartConfig.tooltip = {
            formatter: function () {
              const item= this.point
              function dollarFormat(value) {
                return numeral(value).format('0,0.00');
               }
               return \`<span style="font-size:10px">\${dayjs(this.point.date).format(
                 'dddd, MMMM DD, YYYY'
               )}</span><br/>Transactions: <strong>\${dollarFormat(
               this.point.y
             )}</strong><br/>Price: $\${dollarFormat(this.point.price)}
             \`;
            }
          };
          Highcharts.chart('chart-container', chartConfig);
        </script>
      </body>
    </html>
  `
    : ``;

  if (!mounted) {
    return <LoadingSkeleton />;
  }

  const nearPrice = stats?.near_price ?? '';
  const nearBtcPrice = stats?.near_btc_price ?? '';
  const change24 = stats?.change_24 ?? '';
  const totalTxns = stats?.total_txns ?? 0;

  return (
    <div className="container mx-auto px-3">
      <div className="bg-white soft-shadow rounded-xl overflow-hidden px-5 md:py lg:px-0  dark:bg-black-600">
        <div
          className={`grid grid-flow-col grid-cols-1 ${
            networkId === 'mainnet'
              ? 'grid-rows-3 lg:grid-cols-3'
              : 'grid-rows-2 lg:grid-cols-2'
          } lg:grid-rows-1 divide-y lg:divide-y-0 lg:divide-x lg:py-3 dark:divide-black-200`}
        >
          {networkId === 'mainnet' && (
            <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y  lg:divide-x-0 dark:divide-black-200 md:pt-0 md:pb-0 md:px-5">
              <div className="flex flex-row py-5 lg:pb-5 lg:px-0">
                <div className="items-center flex justify-left mr-3 ">
                  <Image
                    src={`/images/${
                      theme === 'dark'
                        ? 'near price_dark.svg'
                        : 'near price.svg'
                    }`}
                    alt={t ? t('homePage.nearPrice') : 'nearPrice'}
                    width={24}
                    height={24}
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm ">
                    {t ? t('homePage.nearPrice') : 'NEAR PRICE'}
                  </p>
                  {error ? (
                    <Skeleton className="my-1 h-4" />
                  ) : (
                    <Link
                      href="/charts/near-price"
                      className="leading-6 text-nearblue-600 dark:text-neargray-10 hover:no-underline flex items-center "
                    >
                      {nearPrice ? '$' + dollarFormat(nearPrice) : ''}
                      <span className="text-nearblue-700">
                        &nbsp;
                        {nearBtcPrice
                          ? '@ ' + localFormat(stats?.near_btc_price) + ' BTC'
                          : ''}
                      </span>
                      {change24 && (
                        <>
                          {Number(stats?.change_24) > 0 ? (
                            <span className="text-neargreen text-sm">
                              &nbsp;
                              {stats?.change_24
                                ? '(' + dollarFormat(stats?.change_24) + '%)'
                                : stats?.change_24 ?? ''}
                            </span>
                          ) : (
                            <span className="text-red-500 text-sm">
                              &nbsp;
                              {change24
                                ? '(' + dollarFormat(change24) + '%)'
                                : ''}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-row py-5 lg:pt-5 lg:px-0">
                <div className="items-center flex justify-left mr-3 ">
                  <Image
                    src={`/images/${
                      theme === 'dark' ? 'market_dark.svg' : 'market.svg'
                    }`}
                    alt={t ? t('homePage.marketCap') : 'marketCap'}
                    width={24}
                    height={24}
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                    {t('homePage.marketCap')}
                  </p>
                  {error ? (
                    <Skeleton className="my-1 h-4" />
                  ) : (
                    <Link
                      href="/charts/market-cap"
                      className="leading-6 text-nearblue-700 hover:no-underline"
                    >
                      {stats?.market_cap
                        ? '$' + dollarFormat(stats?.market_cap ?? 0)
                        : ''}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:pb-0 md:px-5">
            <div className="flex flex-row justify-between py-5 lg:pb-5 lg:px-0">
              <div className="flex flex-row ">
                <div className="items-center flex justify-left mr-3 ">
                  <Image
                    src={`/images/${
                      theme === 'dark'
                        ? 'transactions_dark.svg'
                        : 'transactions.svg'
                    }`}
                    alt={t ? t('homePage.transactions') : 'transactions'}
                    width={24}
                    height={24}
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                    {t ? t('homePage.transactions') : 'TRANSACTIONS'}
                  </p>
                  {error ? (
                    <Skeleton className="my-1 h-4" />
                  ) : (
                    <div className="flex flex-row">
                      <p className="leading-6 text-nearblue-600 dark:text-neargray-10 mr-0.5">
                        {totalTxns ? currency(stats?.total_txns) : ''}
                      </p>
                      <div className="leading-6 text-nearblue-700">
                        <Tooltip
                          label={'Transactions per second'}
                          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                        >
                          <div>
                            <Link
                              href="/charts/tps"
                              className="hover:no-underline"
                            >
                              {stats?.tps ? `(${stats?.tps} TPS)` : ''}
                            </Link>
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col text-right">
                <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                  {' '}
                  {t ? t('homePage.gasPrice') : 'GAS PRICE'}
                </p>
                {error ? (
                  <Skeleton className="my-1 h-4" />
                ) : (
                  <p className="leading-6 text-nearblue-700">
                    {stats?.gas_price
                      ? gasPrice(stats?.gas_price)
                      : stats?.gas_price ?? ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-row justify-between align-center py-5 lg:pt-5 lg:px-0">
              <div className="flex flex-row ">
                <div className="items-center flex justify-left mr-3 ">
                  <Image
                    src={`/images/${
                      (theme === 'dark' && 'pickaxe_dark.svg') || 'pickaxe.svg'
                    }`}
                    alt={t ? t('homePage.activeValidator') : 'activeValidator'}
                    width={24}
                    height={24}
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                    <Link href="/node-explorer" className="hover:no-underline">
                      {' '}
                      {t
                        ? t('homePage.activeValidator')
                        : 'ACTIVE VALIDATORS'}{' '}
                    </Link>
                  </p>
                  {error ? (
                    <Skeleton className="my-1 h-4" />
                  ) : (
                    <Link
                      href="/node-explorer"
                      className="leading-6 text-nearblue-700 hover:no-underline"
                    >
                      {stats?.nodes_online
                        ? localFormat(stats?.nodes_online)
                        : stats?.nodes_online ?? ''}
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-col text-right">
                <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                  {t ? t('homePage.avgBlockTime') : 'AVG. BLOCK TIME'}
                </p>
                {error ? (
                  <Skeleton className="my-1 h-4" />
                ) : (
                  <Link
                    href="/charts/blocks"
                    className="leading-6 text-nearblue-700 hover:no-underline"
                    suppressHydrationWarning
                  >
                    {stats?.avg_block_time
                      ? `${
                          (stats?.avg_block_time).replace(/\.?0+$/, '') + ' s'
                        }`
                      : ''}
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-1 flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:px-5 dark:bg-black-600">
            <div className="flex-1 py-4 lg:px-0">
              {chartConfig && (
                <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm dark:bg-black-600">
                  {t
                    ? t('homePage.transactionHistory', { days: 14 })
                    : 'NEAR TRANSACTION HISTORY IN 14 DAYS'}
                </p>
              )}
              <div className="mt-1 h-28 dark:bg-black-600">
                {!chartConfig ? (
                  <Skeleton className="h-28" />
                ) : (
                  <iframe
                    className="dark:bg-black-600"
                    srcDoc={iframeSrc}
                    style={{
                      width: '100%',
                      backgroundColor: theme === 'dark' ? '#0D0D0D' : '#ffff',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
