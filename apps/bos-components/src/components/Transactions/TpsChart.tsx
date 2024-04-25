/**
 * Component: TpsCharts
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Near Transactions per Second Chart
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [chartTypes] - Type of chart to be shown, available options are (price, blocks, txns etc)
 * @param {boolean} [poweredBy] - Powered by attribution
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  chartTypes: string;
  poweredBy?: boolean;
  ownerId: string;
  network: string;
  theme: String;
  t: (key: string) => string | undefined;
}

import Skeleton from '@/includes/Common/Skeleton';
import { chartDataInfo } from '@/includes/types';

export default function (props: Props) {
  const { t, ownerId, network, chartTypes, poweredBy, theme } = props;
  const { getConfig, handleRateLimit } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );
  const [chartTpsData, setChartTpsData] = useState<any>([]);
  const config = getConfig && getConfig(network);
  const charts = [
    {
      link: '/charts/near-price',
      text: t ? t('charts:nearPrice.heading') : 'Near Daily Price (USD) Chart',
      image: `/images/charts/near-price.svg`,
      image_dark: `/images/charts/near-price_dark.svg`,
      exclude: `${network}` === 'testnet',
    },
    {
      link: '/charts/market-cap',
      text: t
        ? t('charts:marketCap.heading')
        : 'Near Market Capitalization Chart',
      image: `/images/charts/market-cap.svg`,
      image_dark: `/images/charts/market-cap_dark.svg`,
      exclude: `${network}` === 'testnet',
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
      exclude: `${network}` === 'testnet',
    },
    {
      link: '/charts/txn-volume',
      text: t ? t('charts:txnVolume.heading') : 'Transaction Volume Chart',
      image: `/images/charts/tps.svg`,
      image_dark: `/images/charts/txn-volume_dark.svg`,
      exclude: `${network}` === 'testnet',
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
    function fetchTpsChartData() {
      asyncFetch(`${config.backendUrl}charts/tps`).then(
        (res: { body: { charts: chartDataInfo[] }; status: number }) => {
          if (res.status === 200) {
            if (res?.body) {
              const data = res.body?.charts as chartDataInfo[];
              const seriesByShard: {
                [shard: number]: any[];
              } = {};
              let totalTransactions: any[] = [];

              data.forEach((dataPoint) => {
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
                data: seriesByShard[parseInt(shard)],
              }));

              data &&
                series.push({
                  name: 'Total Transactions',
                  type: 'line',
                  data: totalTransactions,
                });

              setChartTpsData(series);
            }
          } else {
            handleRateLimit(res, fetchTpsChartData);
          }
        },
      );
    }
    if (config?.backendUrl) {
      fetchTpsChartData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl]);

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
            <p className="leading-7 px-4 text-sm py-4 text-nearblue-600 dark:text-neargray-10 border-b dark:border-black-200">
              Near Transactions per Second Chart shows the transactions occure
              per second on Near blockchain.
            </p>
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
                    <img
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
}
