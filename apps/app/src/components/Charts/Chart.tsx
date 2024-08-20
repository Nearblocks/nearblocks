import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Question from '../Icons/Question';
import SwitchButton from '../SwitchButton';
import { yoctoToNear } from '@/utils/libs';
import { ChartConfig, ChartStat, ChartTypeInfo } from '@/utils/types';
import { Tooltip } from '@reach/tooltip';
import { useTheme } from 'next-themes';
import useTranslation from 'next-translate/useTranslation';
import { networkId } from '@/utils/config';
import Image from 'next/image';
import Skeleton from '../skeleton/common/Skeleton';

interface Props {
  chartTypes?: string;
  poweredBy?: boolean;
  chartsData?: {
    charts: ChartStat[];
    status: number;
  };
}

const Chart = (props: Props) => {
  const { chartTypes, poweredBy, chartsData } = props;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [chartInfo, setChartInfo] = useState<ChartTypeInfo>({
    title: '',
    description: '',
  });
  const [logView, setLogView] = useState(false);

  const handleToggle = () => {
    setLogView((prevState) => !prevState);
  };

  const data = chartsData?.charts as ChartStat[];

  const charts = [
    {
      link: '/charts/near-price',
      text: t ? t('charts:nearPrice.heading') : 'Near Daily Price (USD) Chart',
      image: `/images/charts/near-price.svg`,
      image_dark: `/images/charts/near-price_dark.svg`,
      exclude: `${networkId}` === 'testnet',
    },
    {
      link: '/charts/market-cap',
      text: t
        ? t('charts:marketCap.heading')
        : 'Near Market Capitalization Chart',
      image: `/images/charts/market-cap.svg`,
      image_dark: `/images/charts/market-cap_dark.svg`,
      exclude: `${networkId}` === 'testnet',
    },
    {
      link: '/charts/near-supply',
      text: t ? t('charts:nearSupply.heading') : 'Near Supply Growth Chart',
      image: `/images/charts/near-supply.svg`,
      image_dark: `/images/charts/near-supply_dark.svg`,
      exclude: false,
    },
    {
      link: '/charts/txns',
      text: t ? t('charts:txns.heading') : 'Near Daily Transactions Chart',
      image: `/images/charts/txns.svg`,
      image_dark: `/images/charts/txns_dark.svg`,
      exclude: false,
    },
    {
      link: '/charts/blocks',
      text: t ? t('charts:blocks.heading') : 'New Blocks',
      image: `/images/charts/blocks.svg`,
      image_dark: `/images/charts/blocks_dark.svg`,
      exclude: false,
    },
    {
      link: '/charts/addresses',
      text: t ? t('charts:addresses.heading') : 'Near Unique Accounts Chart',
      image: `/images/charts/addresses.svg`,
      image_dark: `/images/charts/addresses_dark.svg`,
      exclude: false,
    },
    {
      link: '/charts/txn-fee',
      text: t ? t('charts:txnFee.heading') : 'Transaction Fee Chart',
      image: `/images/charts/txn-fee.svg`,
      image_dark: `/images/charts/txn-fee_dark.svg`,
      exclude: `${networkId}` === 'testnet',
    },
    {
      link: '/charts/txn-volume',
      text: t ? t('charts:txnVolume.heading') : 'Transaction Volume Chart',
      image: `/images/charts/txn-volume.svg`,
      image_dark: `/images/charts/txn-volume_dark.svg`,
      exclude: `${networkId}` === 'testnet',
    },
    {
      link: '/charts/tps',
      text: 'Near Transactions per Second Chart',
      image: `/images/charts/tps.svg`,
      image_dark: `/images/charts/tps_dark.svg`,
      exclude: false,
    },
  ];

  const chartData = useMemo(() => {
    try {
      const chartTypeMappings = {
        txns: (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.txns),
          date: stat.date,
          blocks: stat.blocks,
          addresses: stat.active_accounts,
        }),
        'market-cap': (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.market_cap),
          date: stat.date,
          price: Number(stat.near_price),
        }),
        'near-supply': (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(yoctoToNear(stat.total_supply, false)),
          date: stat.date,
        }),
        blocks: (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.blocks),
          date: stat.date,
        }),
        addresses: (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.active_accounts),
          date: stat.date,
          addresses: stat.active_accounts,
        }),
        'txn-fee': (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.txn_fee_usd),
          date: stat.date,
          fee: stat.txn_fee,
        }),
        'txn-volume': (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.txn_volume_usd),
          date: stat.date,
          volume: stat.txn_volume,
        }),
        'near-price': (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.near_price),
          date: stat.date,
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

  const replaceWithNull = chartData.map((item: any) => ({
    ...item,
    y: item.y === 0 ? null : item.y,
  }));

  useEffect(() => {
    const fetchData = () => {
      let titleText = '';
      let yLabel = '';
      let description = '';
      switch (chartTypes) {
        case 'market-cap':
          titleText = 'Near Market Capitalization Chart';
          yLabel = 'Near Market Cap (USD)';
          description =
            'Near Market Capitalization chart shows the historical breakdown of Near daily market capitalization and price.';
          break;
        case 'txns':
          titleText = 'Near Daily Transactions Chart';
          yLabel = 'Transactions per Day';
          description =
            'Near Supply Growth Chart shows a breakdown of daily and the total Near supply.';
          break;
        case 'near-supply':
          titleText = 'Near Supply Growth Chart';
          yLabel = 'Near Supply';
          description =
            'Near Supply Growth Chart shows a breakdown of daily and the total Near supply.';
          break;
        case 'blocks':
          titleText = 'New Blocks';
          yLabel = 'Blocks per Day';
          description =
            'New Blocks Chart shows the historical number of blocks produced daily on Near blockchain.';
          break;
        case 'addresses':
          titleText = 'Near Unique Accounts Chart';
          yLabel = 'Accounts per Day';
          description =
            'The chart shows the total distinct numbers of accounts on Near blockchain and the increase in the number of account daily.';
          break;
        case 'txn-fee':
          titleText = 'Transaction Fee Chart';
          yLabel = 'Transaction Fee (USD)';
          description =
            'The chart shows the daily amount in USD spent per transaction on Near blockchain.';
          break;
        case 'txn-volume':
          titleText = 'Transaction Volume Chart';
          yLabel = 'Transaction Volume (USD)';
          description =
            'The chart shows the daily amount in USD spent per transaction on Near blockchain.            ';
          break;
        case 'near-price':
          titleText = 'Near Daily Price (USD) Chart';
          yLabel = 'Near Price (USD)';
          description =
            'Near Daily Price (USD) chart shows the daily historical price for Near in USD.';
          break;
        default:
      }
      setChartInfo({
        title: titleText,
        description: description,
      });

      const fetchedData = {
        chart: {
          height: 430,
          zoomType: 'x',
          backgroundColor: 'transparent',
        },
        accessibility: {
          enabled: false,
        },
        title: {
          text: titleText,
          style: {
            color: theme === 'dark' ? '#e0e0e0' : '#333333',
          },
        },
        subtitle: {
          text: 'Source: NearBlocks.io',
        },
        xAxis: {
          type: 'datetime',
          lineColor: theme === 'dark' ? '#e0e0e0' : '#333333',
          labels: {
            style: {
              color: theme === 'dark' ? '#e0e0e0' : '#333333',
            },
          },
        },
        yAxis: {
          title: {
            text: yLabel,
          },
          lineColor: theme === 'dark' ? '#e0e0e0' : '#333333',
          labels: {
            style: {
              color: theme === 'dark' ? '#e0e0e0' : '#333333',
            },
          },
          gridLineColor: theme === 'dark' ? '#1F2228' : '#e6e6e6',
        },
        legend: {
          enabled: false,
        },
        series: [
          {
            type: 'area',
            color: 'rgba(3, 63, 64, 1)',
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
            },
          },
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
        ${
          poweredBy
            ? '<p style="text-align: center; color: #000; font-size: 0.75rem; padding-top: 1rem; padding-bottom: 1rem; font-family: sans-serif;">Powered by <a href="https://beta.nearblocks.io/?utm_source=bos_widget&utm_medium=Charts" target="_blank" style="font-weight: 600; font-family: sans-serif; color: #000; text-decoration: none;">NearBlocks</a></p>'
            : ''
        }
        <script type="text/javascript">
          const chartConfig = ${JSON.stringify(chartConfig)};
          if (${logView}) {
            chartConfig.yAxis.type = 'logarithmic';
            chartConfig.series[0].data = ${JSON.stringify(replaceWithNull)};
            chartConfig.plotOptions.series.connectNulls = ${true};
          }
          else{
           chartConfig.series[0].data = ${JSON.stringify(chartData)};
          }
          chartConfig.tooltip = {
            formatter: function () {
              const item= this.point;
              function dollarFormat(value) {
                return numeral(value).format('0,0.00');
              }
  
              function yoctoToNear(yocto, format) {
                const YOCTO_PER_NEAR = Big(10).pow(24).toString();
                const near = Big(yocto).div(YOCTO_PER_NEAR).toString();
                return format ? dollarFormat(near) : near;
              }
  
              let tooltipContent = "";
  
              switch ("${chartTypes}") {
                case "market-cap":
                  tooltipContent = \`
                    \${dayjs(item.date).format('dddd, MMMM DD, YYYY')}<br/>
                    Market Cap: <strong>$\${dollarFormat(item.y)}</strong><br/>
                    Near Price: <strong>$\${dollarFormat(item.price)}</strong>
                  \`;
                  break;
                  case "txns":
                    tooltipContent = \`
                      \${dayjs(item.date).format('dddd, MMMM DD, YYYY')}<br/>
                      Total Transactions: <strong>\${dollarFormat(item.y)}</strong><br/>
                      Total Blocks Count: <strong>\${dollarFormat(item.blocks)}</strong><br/>
                      New Addresses Seen: <strong>\${dollarFormat(item.addresses)}</strong>
                    \`;
                    break;
                  case "near-supply":
                      tooltipContent = \`
                        \${dayjs(item.date).format('dddd, MMMM DD, YYYY')}<br/>
                        Total Supply: <strong>\${dollarFormat(item.y)} Ⓝ</strong>
                      \`;
                    break;
                  case "blocks":
                      tooltipContent = \`
                        \${dayjs(item.date).format('dddd, MMMM DD, YYYY')}<br/>
                        Total Blocks: <strong>\${dollarFormat(item.y)}</strong><br/>\`;
                    break;
                  case "addresses":
                      tooltipContent = \`
                        \${dayjs(item.date).format('dddd, MMMM DD, YYYY')}<br/>
                        Total Unique Addresses: <strong>\${dollarFormat(item.y)}</strong>\`;
                    break;
                    case "txn-fee":
                      tooltipContent = \`
                        \${dayjs(item.date).format('dddd, MMMM DD, YYYY')}<br/>
                        Txn Fee: <strong>$\${dollarFormat(item.y)}</strong><br/>
                        Txn Fee (Ⓝ): <strong>\${yoctoToNear(item.fee,true)} Ⓝ</strong><br/>
                        \`;
                    break;
                  case "txn-volume":
                      tooltipContent = \`
                        \${dayjs(item.date).format('dddd, MMMM DD, YYYY')}<br/>
                        Txn Fee: <strong>$\${dollarFormat(item.y)}</strong><br/>
                        Txn Fee (Ⓝ): <strong>\${yoctoToNear(item.volume,true)} Ⓝ</strong><br/>
                        \`;
                    break;
                  case "near-price":
                      tooltipContent = \`
                        \${dayjs(item.date).format('dddd, MMMM DD, YYYY')}<br/>
                        Near Price: <strong>$\${dollarFormat(item.y)}</strong>
                        \`;
                    break;
                default:
                  // Handle other cases or set a default tooltip content
                  tooltipContent = \`
                    \${dayjs(item.date).format('dddd, MMMM DD, YYYY')}<br/>
                    \${item.y}
                  \`;
              }
  
              return tooltipContent;
            }
          };
          Highcharts.chart('chart-container', chartConfig);
        </script>
      </body>
    </html>
  `
    : ``;

  return (
    <div>
      {chartTypes && (
        <>
          <div
            className="block bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden mb-10"
            style={{ height: 580 }}
          >
            <div className="border-b dark:border-black-200 flex justify-between items-center text-center">
              {chartData?.length > 0 ? (
                <>
                  <p className="leading-7 px-4 text-sm py-4 text-nearblue-600 dark:text-neargray-10">
                    {chartInfo?.description}
                  </p>
                  <div className="flex items-center text-nearblue-600 dark:text-neargray-10">
                    <Tooltip
                      label="Toggle between Log View and Normal View. Log View uses logarithmic scale."
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
                    >
                      <span>
                        <Question className="w-4 h-4 fill-current mr-2" />
                      </span>
                    </Tooltip>
                    <div className="w-8 flex">
                      <SwitchButton
                        selected={logView}
                        onChange={handleToggle}
                      />
                    </div>
                    <label className="text-nearblue-600 dark:text-neargray-10 text-sm leading-none pr-[15px] px-2">
                      {'Log View'}
                    </label>
                  </div>
                </>
              ) : (
                <div className="py-5 mt-1 ml-4">
                  <Skeleton className="w-80 h-4" />
                </div>
              )}
            </div>
            <div className="pl-2 pr-2 py-8 h-full ">
              {chartData?.length ? (
                <iframe
                  srcDoc={iframeSrc}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: theme === 'dark' ? '#0D0D0D' : '#FFFF',
                  }}
                />
              ) : (
                <Skeleton className="h-[93%] w-full" />
              )}
            </div>
          </div>
          <h2 className="mb-4 px-2 text-lg text-gray-700 dark:text-neargray-10">
            {t('charts:otherHeading')}
          </h2>
        </>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {charts?.map(
          (chart, index) =>
            chart?.exclude === false && (
              <div
                key={index}
                className="block bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden"
              >
                <Link
                  href={chart?.link}
                  className="block leading-7 p-3 text-sm text-nearblue-600 dark:text-neargray-10 border-b dark:border-black-200 truncate"
                >
                  <h2>{chart?.text}</h2>
                </Link>
                <div className="pl-2 pr-4 py-6">
                  <Link href={chart?.link}>
                    <Image
                      src={theme === 'dark' ? chart?.image_dark : chart?.image}
                      alt={chart?.text}
                      width={600}
                      height={550}
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
