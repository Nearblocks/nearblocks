import { useEffect, useState } from 'react';
import SwitchButton from '../SwitchButton';
import Question from '../Icons/Question';
import Link from 'next/link';
import { chartDataInfo } from '@/utils/types';
import { Tooltip } from '@reach/tooltip';
import { useTheme } from 'next-themes';
import useTranslation from 'next-translate/useTranslation';
import { networkId } from '@/utils/config';
import Image from 'next/image';
import Skeleton from '../skeleton/common/Skeleton';

interface Props {
  chartTypes: string;
  poweredBy?: boolean;
  data?: {
    charts: chartDataInfo[];
    status: number;
  };
}
const TpsChart = (props: Props) => {
  const { chartTypes, poweredBy, data } = props;
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [chartTpsData, setChartTpsData] = useState<any>([]);
  const [logView, setLogView] = useState(false);

  const handleToggle = () => {
    setLogView((prevState) => !prevState);
  };

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

  useEffect(() => {
    if (data) {
      const seriesByShard: {
        [shard: number]: any[];
      } = {};
      let totalTransactions: any[] = [];
      data.charts.forEach((dataPoint: chartDataInfo) => {
        let totalTxns = 0;
        dataPoint.shards.forEach((shard: any) => {
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

      const series = Object.keys(seriesByShard).map((shard) => ({
        name: `Shard ${shard}`,
        type: 'line',
        data: seriesByShard[parseInt(shard)].reverse(),
      }));

      data &&
        series.push({
          name: 'Total Transactions',
          type: 'line',
          data: totalTransactions.reverse(),
        });
      setChartTpsData(series);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const chartConfig = {
    chart: {
      zoomType: 'x',
      panning: true,
      panKey: 'shift',
      height: 430,
      backgroundColor: 'transparent',
    },
    boost: {
      useGPUTranslations: true,
    },
    title: {
      text: `Near Transactions per Second Chart`,
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
        text: 'Transactions per Second',
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
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      itemStyle: {
        color: theme === 'dark' ? '#e0e0e0' : '#333333',
      },
      itemHoverStyle: {
        color: theme === 'dark' ? '#e0e0e0' : '#333333',
      },
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
      },
    },
    tooltip: {
      valueDecimals: 2,
      headerFormat:
        '<span style="color: rgb(51, 51, 51); font-size: 0.8em; fill: rgb(51, 51, 51);">{point.key:%A, %e %b %Y, %H:%M:%S}</span><br/>',
    },
    series: chartTpsData,
  };

  const iframeSrc = `
  <html>
    <head>
      <script src="https://code.highcharts.com/highcharts.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/dayjs@1.10.4"></script>
      <script src="https://cdn.jsdelivr.net/npm/numeral@2.0.6/numeral.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/big.js@5.2.2"></script>
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
          ? '<p style="text-align: center; color: #000; font-size: 0.75rem; padding-top: 1rem; padding-bottom: 1rem; font-family: sans-serif;">Powered by <a href="https://nearblocks.io/?utm_source=bos_widget&utm_medium=Charts" target="_blank" style="font-weight: 600; font-family: sans-serif; color: #000; text-decoration: none;">NearBlocks</a></p>'
          : ''
      }
      <script type="text/javascript">
        const chartConfig = ${JSON.stringify(chartConfig)};
        if (${logView}) {
          chartConfig.yAxis.type = 'logarithmic'
        }
        Highcharts.chart('chart-container', chartConfig);
      </script>
    </body>
  </html>
`;

  return (
    <div>
      {chartTypes && (
        <>
          <div
            className="block bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden mb-10"
            style={{ height: 580 }}
          >
            <div className="border-b dark:border-black-200 flex justify-between items-center text-center">
              {chartTpsData?.length > 0 ? (
                <>
                  <p className="leading-7 px-4 text-sm py-4 text-nearblue-600 dark:text-neargray-10">
                    Near Transactions per Second Chart shows the transactions
                    occuring per second on Near blockchain.
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
              {chartTpsData && chartTpsData?.length ? (
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
export default TpsChart;
