'use client';
import dayjs from 'dayjs';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useMemo } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import { Link } from '@/i18n/routing';
import { dollarFormat } from '@/utils/app/libs';
import { currency, localFormat } from '@/utils/libs';
import { gasPrice } from '@/utils/near';
import { ChartInfo, StatusInfo } from '@/utils/types';

import Tooltip from '../common/Tooltip';

interface Props {
  chartsDetails: { charts: ChartInfo[] };
  error: boolean;
  stats: StatusInfo;
  theme: string;
}

const TransactionChart: React.FC<{
  chartData: ChartInfo[];
  cookieTheme: string;
}> = ({ chartData, cookieTheme }) => {
  let { theme } = useTheme();

  if (theme == undefined) {
    theme = cookieTheme;
  }

  const chartOptions = useMemo(() => {
    // Sort data by date
    const sortedData = [...chartData].sort(
      (a: ChartInfo, b: ChartInfo) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Prepare series and categories
    const series = sortedData.map((stat) => ({
      date: stat.date,
      price: stat.near_price,
      y: Number(stat.txns),
    }));

    const categories = sortedData.map((stat) =>
      dayjs(stat.date).format('MMM DD'),
    );

    return {
      chart: {
        backgroundColor: 'transparent',
        height: 110,
        spacingBottom: 0,
        spacingLeft: 0,
        spacingRight: 10,
        spacingTop: 10,
        type: 'spline',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        spline: {
          lineWidth: 1,
          marker: {
            radius: 0,
          },
          states: {
            hover: {
              lineWidth: 1,
            },
          },
        },
      },
      series: [
        {
          color: '#80D1BF',
          data: series,
          type: 'spline',
        },
      ],
      title: {
        text: null,
      },
      tooltip: {
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          const point = this.point as any;
          return `
            <span style="font-size:10px">${dayjs(point.date).format(
              'dddd, MMMM DD, YYYY',
            )}</span><br/>
            Transactions: <strong>${dollarFormat(Number(point.y))}</strong><br/>
            Price: $${dollarFormat((point as any).price)}
          `;
        },
      },
      xAxis: {
        categories: categories,
        labels: {
          step: 7,
          style: {
            color: theme === 'dark' ? '#e0e0e0' : '#333333',
          },
        },
        lineWidth: 0,
        tickLength: 0,
        type: 'datetime',
      },
      yAxis: {
        gridLineWidth: 0,
        labels: {
          style: {
            color: theme === 'dark' ? '#e0e0e0' : '#333333',
          },
        },
        title: {
          text: null,
        },
      },
    };
  }, [chartData, theme]);

  return (
    <div className="transaction-chart">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

const Overview = ({ chartsDetails, stats, theme: cookieTheme }: Props) => {
  const t = useTranslations();
  let { theme } = useTheme();
  const { networkId } = useConfig();

  if (theme == undefined) {
    theme = cookieTheme;
  }

  const charts = chartsDetails?.charts;

  const nearPrice = stats?.near_price ?? '';
  const nearBtcPrice = stats?.near_btc_price ?? '';
  const change24 = stats?.change_24 ?? '';
  const totalTxns = stats?.total_txns ?? 0;

  return (
    <div className="container-xxl mx-auto px-5">
      <div className="bg-white soft-shadow rounded-xl overflow-hidden px-2 sm:px-5 md:py lg:px-0 dark:bg-black-600">
        <div
          className={`grid grid-flow-col grid-cols-1 ${
            networkId === 'mainnet'
              ? 'grid-rows-3 lg:grid-cols-3'
              : 'grid-rows-2 lg:grid-cols-2'
          } lg:grid-rows-1 divide-y lg:divide-y-0 lg:divide-x lg:py-3 dark:divide-black-200`}
        >
          {networkId === 'mainnet' && (
            <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y  lg:divide-x-0 dark:divide-black-200 md:pt-0 md:pb-0 md:px-5">
              <div className="flex flex-row py-5 lg:pt-5 lg:px-0">
                <div className="items-center flex justify-left mr-3 ">
                  <Image
                    alt={t ? t('homePage.nearPrice') : 'nearPrice'}
                    height={24}
                    loading="eager"
                    src={`/images/${
                      theme === 'dark'
                        ? 'near_price_dark.svg'
                        : 'near_price.svg'
                    }`}
                    width={24}
                  />
                </div>
                <div className="ml-2 flex flex-col justify-between">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm ">
                    {t ? t('homePage.nearPrice') : 'NEAR PRICE'}
                  </p>
                  <Link
                    className="leading-6 text-nearblue-600 dark:text-neargray-10 hover:no-underline flex items-center"
                    href="/charts/near-price"
                  >
                    {nearPrice ? '$' + dollarFormat(Number(nearPrice)) : ''}
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
                              ? '(' +
                                dollarFormat(Number(stats?.change_24)) +
                                '%)'
                              : stats?.change_24 ?? ''}
                          </span>
                        ) : (
                          <span className="text-red-500 text-sm">
                            &nbsp;
                            {change24
                              ? '(' + dollarFormat(Number(change24)) + '%)'
                              : ''}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </div>
              </div>
              <div className="flex flex-row py-5 lg:pt-5 lg:px-0">
                <div className="items-center flex justify-left mr-3 ">
                  <Image
                    alt={t ? t('homePage.marketCap') : 'marketCap'}
                    height={24}
                    loading="eager"
                    src={`/images/${
                      theme === 'dark' ? 'market_dark.svg' : 'market.svg'
                    }`}
                    width={24}
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                    {t('homePage.marketCap')}
                  </p>
                  <Link
                    className="leading-6 text-nearblue-700 hover:no-underline"
                    href="/charts/market-cap"
                  >
                    {stats?.market_cap
                      ? '$' + dollarFormat(Number(stats?.market_cap) ?? 0)
                      : ''}
                  </Link>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:pb-0 md:px-5">
            <div className="flex flex-row justify-between py-5 lg:pb-5 lg:px-0">
              <div className="flex flex-row ">
                <div className="items-center flex justify-left mr-3 ">
                  <Image
                    alt={t ? t('homePage.transactions') : 'transactions'}
                    height={24}
                    loading="eager"
                    src={`/images/${
                      theme === 'dark'
                        ? 'transactions_dark.svg'
                        : 'transactions.svg'
                    }`}
                    width={24}
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                    {t ? t('homePage.transactions') : 'TRANSACTIONS'}
                  </p>
                  <div className="flex flex-row">
                    <p className="leading-6 text-nearblue-600 dark:text-neargray-10 mr-0.5">
                      {totalTxns ? currency(stats?.total_txns) : ''}
                    </p>
                    <div className="leading-6 text-nearblue-700">
                      <Tooltip
                        className={'left-1/2 whitespace-nowrap max-w-[200px]'}
                        position="top"
                        tooltip={'Transactions per second'}
                      >
                        <div>
                          <Link
                            className="hover:no-underline"
                            href="/charts/tps"
                          >
                            {stats?.tps ? `(${stats?.tps} TPS)` : ''}
                          </Link>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col text-right">
                <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                  {t ? t('homePage.gasPrice') : 'GAS PRICE'}
                </p>
                <p className="leading-6 text-nearblue-700">
                  {stats?.gas_price
                    ? gasPrice(stats?.gas_price)
                    : stats?.gas_price ?? ''}
                </p>
              </div>
            </div>
            <div className="flex flex-row justify-between align-center py-5 lg:pt-5 lg:px-0">
              <div className="flex flex-row ">
                <div className="items-center flex justify-left mr-3 ">
                  <Image
                    alt={t ? t('homePage.activeValidator') : 'activeValidator'}
                    height={24}
                    loading="eager"
                    src={`/images/${
                      theme === 'dark' ? 'pickaxe_dark.svg' : 'pickaxe.svg'
                    }`}
                    width={24}
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                    <Link className="hover:no-underline" href="/node-explorer">
                      {t ? t('homePage.activeValidator') : 'ACTIVE VALIDATORS'}{' '}
                    </Link>
                  </p>
                  <Link
                    className="leading-6 text-nearblue-700 hover:no-underline"
                    href="/node-explorer"
                  >
                    {stats?.nodes_online
                      ? localFormat(stats?.nodes_online)
                      : stats?.nodes_online ?? ''}
                  </Link>
                </div>
              </div>
              <div className="flex flex-col text-right">
                <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                  {t ? t('homePage.avgBlockTime') : 'AVG. BLOCK TIME'}
                </p>
                <Link
                  className="leading-6 text-nearblue-700 hover:no-underline"
                  href="/charts/blocks"
                  suppressHydrationWarning
                >
                  {stats?.avg_block_time
                    ? `${(stats?.avg_block_time).replace(/\.?0+$/, '') + ' s'}`
                    : ''}
                </Link>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-1 flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:px-5 dark:bg-black-600">
            <div className="flex-1 py-4 lg:px-0">
              {charts && charts.length > 0 && (
                <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm dark:bg-black-600">
                  {t
                    ? t('homePage.transactionHistory', { days: 14 })
                    : 'NEAR TRANSACTION HISTORY IN 14 DAYS'}
                </p>
              )}
              <div className="mt-1 h-28 dark:bg-black-600">
                <TransactionChart
                  chartData={charts || []}
                  cookieTheme={cookieTheme}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
