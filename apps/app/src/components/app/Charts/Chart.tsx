'use client';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useMemo, useState, useCallback } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import { Link } from '@/i18n/routing';
import dayjs from '@/utils/app/dayjs';
import { dollarFormat } from '@/utils/app/libs';
import { yoctoToNear } from '@/utils/libs';
import { ChartStat, ChartTypeInfo } from '@/utils/types';

import Tooltip from '../common/Tooltip';
import Question from '../Icons/Question';
import Skeleton from '../skeleton/common/Skeleton';
import SwitchButton from '../SwitchButton';
import ChartToggle from '../common/ChartToggle';

interface Props {
  chartsData?: {
    charts: ChartStat[];
    status: number;
  };
  chartTypes?: string;
  poweredBy?: boolean;
  theme: string;
}

const CHART_TYPE_MAPPINGS = {
  addresses: (stat: ChartStat) => ({
    addresses: stat.active_accounts,
    date: stat.date,
    x: new Date(stat.date).valueOf(),
    y: Number(stat.active_accounts),
  }),
  blocks: (stat: ChartStat) => ({
    date: stat.date,
    x: new Date(stat.date).valueOf(),
    y: Number(stat.blocks),
  }),
  'market-cap': (stat: ChartStat) => ({
    date: stat.date,
    price: Number(stat.near_price),
    x: new Date(stat.date).valueOf(),
    y: Number(stat.market_cap),
  }),
  /*  'multi-chain-txns': (stat: ChartStat) => ({
    date: stat.date,
    multiChainTxns: stat.multichain_txns,
    x: new Date(stat.date).valueOf(),
    y: Number(stat.multichain_txns),
  }), */
  'near-price': (stat: ChartStat) => ({
    date: stat.date,
    x: new Date(stat.date).valueOf(),
    y: Number(stat.near_price),
  }),
  'near-supply': (stat: ChartStat) => ({
    date: stat.date,
    x: new Date(stat.date).valueOf(),
    y: Number(yoctoToNear(stat.total_supply, false)),
  }),
  'txn-fee': (stat: ChartStat) => ({
    date: stat.date,
    fee: Number(stat.txn_fee),
    x: new Date(stat.date).valueOf(),
    y: Number(stat.txn_fee_usd),
  }),
  'txn-volume': (stat: ChartStat) => ({
    date: stat.date,
    volume: stat.txn_volume,
    x: new Date(stat.date).valueOf(),
    y: Number(stat.txn_volume_usd),
  }),
  txns: (stat: ChartStat) => ({
    addresses: stat.active_accounts,
    blocks: stat.blocks,
    date: stat.date,
    x: new Date(stat.date).valueOf(),
    y: Number(stat.txns),
  }),
};

const CHART_INFO_CONFIG = {
  'market-cap': {
    title: 'Near Market Capitalization Chart',
    yLabel: 'Near Market Cap (USD)',
    description:
      'Near Market Capitalization chart shows the historical breakdown of Near daily market capitalization price and Near daily  price',
  },
  txns: {
    title: 'Near Daily Transactions Chart',
    yLabel: 'Transactions per Day',
    description:
      'The chart highlights the total number of transactions on Near blockchain with daily individual breakdown for total blocks and total new account seen.',
  },
  'near-supply': {
    title: 'Near Supply Growth Chart',
    yLabel: 'Near Supply',
    description:
      'Near Supply Growth Chart shows a breakdown of daily and the total Near supply.',
  },
  blocks: {
    title: 'Near Block Count',
    yLabel: 'Blocks per Day',
    description:
      'Near Block Count Chart shows the historical number of blocks produced daily on Near blockchain.',
  },
  addresses: {
    title: 'Near Unique Accounts Chart',
    yLabel: 'Accounts per Day',
    description:
      'The chart shows the total distinct numbers of accounts on Near blockchain and the increase in the number of account daily.',
  },
  'txn-fee': {
    title: 'Transaction Fee Chart',
    yLabel: 'Transaction Fee (USD)',
    description: {
      USD: 'The chart shows the daily amount in USD spent per transaction on Near blockchain.',
      Near: 'The chart shows the daily amount in Near Price spent per transaction on Near blockchain',
    },
  },
  'txn-volume': {
    title: 'Transaction Volume Chart',
    yLabel: 'Transaction Volume (USD)',
    description: {
      USD: 'The chart shows the daily amount in USD spent per transaction on Near blockchain.',
      Near: 'The chart shows the daily amount in Near Price spent per transaction on Near blockchain',
    },
  },
  'near-price': {
    title: 'Near Daily Price (USD) Chart',
    yLabel: 'Near Price (USD)',
    description:
      'Near Daily Price (USD) chart shows the daily historical price for Near in USD.',
  },
  /*  'multi-chain-txns': {
    title: 'Multi Chain Transactions Chart',
    yLabel: 'Multichain Transactions per Day',
    description: 'The chart highlights the total number of multichain transactions on Near blockchain.',
  }, */
  default: {
    title: 'Near Blockchain Chart',
    yLabel: 'Value',
    description: 'Chart displaying Near blockchain metrics',
  },
};

const Chart = (props: Props) => {
  const { chartsData, chartTypes, theme: cookieTheme } = props;

  const t = useTranslations();
  let { theme } = useTheme();
  const [chartInfo, setChartInfo] = useState<ChartTypeInfo>({
    description: '',
    title: '',
  });
  const [logView, setLogView] = useState(false);
  const [priceViewTxnFee, setPriceViewTxnFee] = useState(false);
  const [txnVolumeView, setTxnVolumeView] = useState(false);
  const [chartOptions, setChartOptions] = useState<Highcharts.Options | null>(
    null,
  );
  const { networkId } = useConfig();

  if (theme === undefined) {
    theme = cookieTheme;
  }

  const handleToggle = useCallback(() => {
    setLogView((prev) => !prev);
  }, []);

  const handleTxnFeeToggle = () => {
    setPriceViewTxnFee((prev) => !prev);
  };

  const handleTxn_volume = () => {
    setTxnVolumeView((prev) => !prev);
  };

  const data = chartsData?.charts as ChartStat[];

  const charts = useMemo(
    () => [
      {
        exclude: `${networkId}` === 'testnet',
        image: `/images/charts/near-price.svg`,
        image_dark: `/images/charts/near-price_dark.svg`,
        link: '/charts/near-price',
        text: t
          ? t('charts.nearPrice.heading')
          : 'Near Daily Price (USD) Chart',
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
        text: t ? t('blocksCharts.heading') : 'Near Block Count',
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
      /* {
      exclude: false,
      image: `/images/charts/multi-chain-txns.svg`,
      image_dark: `/images/charts/multi-chain-txns_dark.svg`,
      link: '/charts/multi-chain-txns',
      text: t ? t('multichainTxns.heading') : 'Multi Chain Transactions Chart',
    }, */
    ],
    [networkId, t],
  );

  const chartData = useMemo(() => {
    if (!data || !chartTypes) return [];

    try {
      const mappingFunction =
        CHART_TYPE_MAPPINGS[chartTypes as keyof typeof CHART_TYPE_MAPPINGS];
      return mappingFunction ? data.map(mappingFunction) : [];
    } catch (error) {
      return [];
    }
  }, [data, chartTypes]);

  const processedChartData = useMemo(() => {
    return logView
      ? chartData.map((item) => ({
          ...item,
          x: item.x,
          y: item.y === 0 ? null : item.y,
        }))
      : chartData.map((item) => ({
          ...item,
          x: item.x,
          y: item.y,
        }));
  }, [chartData, logView]);

  const createTooltipFormatter = useCallback(
    (chartType: string) => {
      return function (this: Highcharts.TooltipFormatterContextObject) {
        const point = this.point;

        const date = dayjs(point.x).format('dddd, MMMM DD, YYYY');

        switch (chartType) {
          case 'market-cap':
            return `
            ${date}<br/>
            Market Cap: <strong>$${dollarFormat(Number(point.y))}</strong><br/>
            Near Price: <strong>Ⓝ${dollarFormat((point as any).price)}</strong>
            `;
          case 'txns':
            return `
            ${date}<br/>
            Total Transactions: <strong>${dollarFormat(
              Number(point.y),
            )}</strong><br/>
            Total Blocks Count: <strong>${dollarFormat(
              (point as any).blocks,
            )}</strong><br/>
            New Addresses Seen: <strong>${dollarFormat(
              (point as any).addresses,
            )}</strong>
          `;
          case 'near-supply':
            return `
            ${date}<br/>
            Total Supply: <strong>${dollarFormat(Number(point.y))} Ⓝ</strong>
          `;
          case 'txn-fee':
            if (priceViewTxnFee) {
              return `
                ${date}<br/>
                Txn Fee (Ⓝ): <strong>${yoctoToNear(
                  (point as any).fee ?? 0,
                  true,
                )} Ⓝ</strong><br/>`;
            }
            return `
              ${date}<br/>
              Txn Fee : <strong>$${dollarFormat(Number(point.y))}
              </strong>
            `;

          case 'txn-volume':
            if (txnVolumeView) {
              return `
              ${date}<br/>
             Txn Fee (Ⓝ): <strong> ${yoctoToNear(
               (point as any).volume ?? 0,
               true,
             )} Ⓝ</strong><br/>
              `;
            }
            return `
              ${date}<br/>
              Txn Fee: <strong>$${dollarFormat(Number(point.y))}</strong><br/>
            `;

          default:
            return `
            ${date}<br/>
            Value: <strong>${dollarFormat(Number(point.y))}</strong>
          `;
        }
      };
    },
    [priceViewTxnFee, txnVolumeView],
  );

  useEffect(() => {
    if (!chartTypes || chartData.length === 0) return;

    const rawConfig =
      CHART_INFO_CONFIG[chartTypes as keyof typeof CHART_INFO_CONFIG] ||
      CHART_INFO_CONFIG.default;

    const description =
      chartTypes === 'txn-fee' && typeof rawConfig.description === 'object'
        ? priceViewTxnFee
          ? rawConfig.description.Near
          : rawConfig.description.USD
        : chartTypes === 'txn-volume' &&
          typeof rawConfig.description === 'object'
        ? txnVolumeView
          ? rawConfig.description.Near
          : rawConfig.description.USD
        : (rawConfig.description as string);

    const config =
      CHART_INFO_CONFIG[chartTypes as keyof typeof CHART_INFO_CONFIG] ||
      CHART_INFO_CONFIG.default;

    setChartInfo({ description, title: config.title });

    const options: Highcharts.Options = {
      accessibility: {
        enabled: false,
      },
      boost: {
        useGPUTranslations: true,
      },
      chart: {
        backgroundColor: 'transparent',
        height: 430,
        panKey: 'shift',
        type: 'area',
        zooming: {
          type: 'x',
        },
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              chart: {
                height:
                  chartTypes === 'txns' || chartTypes === 'addresses'
                    ? 350
                    : 390,
              },
            },
          },
        ],
      },
      credits: { enabled: false },
      plotOptions: {
        area: {
          connectNulls: logView,
          fillColor: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, 'rgba(3, 63, 64, 0.8)'],
              [1, 'rgba(3, 63, 64, 0)'],
            ],
          },
          lineWidth: 1,
          marker: { enabled: false },
          threshold: null,
        },
        series: {
          label: {
            connectorAllowed: false,
          },
          lineWidth: 1,
          states: {
            hover: {
              enabled: false,
            },
          },
        },
      },
      series: [
        {
          color: 'rgba(3, 63, 64, 1)',
          data: processedChartData,
          showInLegend: false,
          type: 'area',
        },
      ],
      subtitle: {
        text: 'Source: NearBlocks.io',
      },
      title: {
        style: {
          color: theme === 'dark' ? '#e0e0e0' : '#333333',
        },
        text: config.title,
      },
      tooltip: {
        formatter: createTooltipFormatter(chartTypes),
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
          formatter: function () {
            const label = this.axis.defaultLabelFormatter.call(this);
            return label.replace(
              /([\d\s]+\.?\d*)([KMG]?)/,
              (_, num, suffix) => {
                return (
                  num.replace(/\s/g, ',') +
                  (suffix === 'G' ? 'B' : suffix || '')
                );
              },
            );
          },
          style: {
            color: theme === 'dark' ? '#e0e0e0' : '#333333',
          },
        },
        lineColor: theme === 'dark' ? '#e0e0e0' : '#333333',
        title: { text: config.yLabel },
        type:
          chartTypes === 'txn-fee' && priceViewTxnFee
            ? logView
              ? 'logarithmic'
              : 'linear'
            : chartTypes === 'txn-volume' && txnVolumeView
            ? logView
              ? 'logarithmic'
              : 'linear'
            : logView
            ? 'logarithmic'
            : 'linear',
      },
    };

    setChartOptions(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartTypes, theme, logView, chartData, priceViewTxnFee, txnVolumeView]);

  return (
    <div>
      {chartTypes && (
        <>
          <div
            className="block bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden mb-10"
            style={{ height: 580 }}
          >
            <div className="border-b dark:border-black-200 py-4 px-4 flex justify-between items-center">
              {chartOptions && chartData?.length > 0 ? (
                <div className="w-full flex sm:justify-between flex-wrap gap-y-2">
                  <p className="leading-7 text-sm text-nearblue-600 dark:text-neargray-10">
                    {chartInfo?.description}
                  </p>

                  <div className="flex justify-between gap-2">
                    {chartTypes === 'txn-fee' && (
                      <ChartToggle
                        tooltip={`Toggle to show ${
                          priceViewTxnFee ? 'USD' : 'Near Price'
                        }`}
                        selected={priceViewTxnFee}
                        onChange={handleTxnFeeToggle}
                        label={priceViewTxnFee ? 'Near' : 'USD'}
                      />
                    )}

                    {chartTypes === 'txn-volume' && (
                      <ChartToggle
                        tooltip={`Toggle to show ${
                          txnVolumeView ? 'USD' : 'Near Price'
                        }`}
                        selected={txnVolumeView}
                        onChange={handleTxn_volume}
                        label={txnVolumeView ? 'Near' : 'USD'}
                      />
                    )}

                    <span className="items-center text-nearblue-600 dark:text-neargray-10 inline-flex">
                      <Tooltip
                        className={'sm:left-1/2 left-20 max-w-[200px] w-40'}
                        position="bottom"
                        tooltip="Toggle between Log View and Normal View. Log View uses logarithmic scale."
                      >
                        <span>
                          <Question className="w-4 h-4 fill-current mr-2" />
                        </span>
                      </Tooltip>
                      <div className="flex">
                        <SwitchButton
                          onChange={handleToggle}
                          selected={logView}
                        />
                      </div>
                      <label className="text-nearblue-600 dark:text-neargray-10 text-sm leading-none px-2">
                        {'Log View'}
                      </label>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-1 my-0.5 pr-5">
                  <Skeleton className="sm:w-80 w-40 h-4" />
                </div>
              )}
            </div>
            <div className="pl-2 pr-2 py-8 h-full ">
              {chartData?.length && chartOptions ? (
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
                  className="block leading-7 p-3 text-sm text-nearblue-600 dark:text-neargray-10 border-b dark:border-black-200 truncate font-medium"
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

export default Chart;
