/**
 * Component: TransactionsOverview
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Transactions Overview.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  network: string;
  theme: String;
  t: (key: string, options?: { days?: number }) => string | undefined;
}

import Skeleton from '@/includes/Common/Skeleton';
import {
  ChartConfigType,
  StatusInfo,
  ChartInfo,
  ChartSeriesInfo,
} from '@/includes/types';

export default function ({ network, t, ownerId, theme }: Props) {
  const { currency, dollarFormat, formatCustomDate, localFormat } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { getConfig, handleRateLimit } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const { gasPrice } = VM.require(`${ownerId}/widget/includes.Utils.near`);

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatusInfo>({} as StatusInfo);
  const [charts, setCharts] = useState<ChartInfo[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfigType>(
    {} as ChartConfigType,
  );

  const config = getConfig && getConfig(network);

  useEffect(() => {
    let delay = 15000;

    function fetchStats() {
      asyncFetch(`${config?.backendUrl}stats`)
        .then((data: { body: { stats: StatusInfo[] }; status: number }) => {
          const resp = data?.body?.stats?.[0];
          if (data.status === 200) {
            setStats({
              avg_block_time: resp.avg_block_time,
              block: resp.block,
              change_24: resp.change_24,
              gas_price: resp.gas_price,
              high_24h: resp.high_24h,
              high_all: resp.high_all,
              low_24h: resp.low_24h,
              low_all: resp.low_all,
              market_cap: resp.market_cap,
              near_btc_price: resp.near_btc_price,
              near_price: resp.near_price,
              nodes: resp.nodes,
              nodes_online: resp.nodes_online,
              total_supply: resp.total_supply,
              total_txns: resp.total_txns,
              volume: resp.volume,
              tps: resp.tps,
            });
            if (isLoading) setIsLoading(false);
          } else {
            handleRateLimit(data, fetchStats, () => {
              if (isLoading) setIsLoading(false);
            });
          }
        })
        .catch(() => {});
    }
    if (config?.backendUrl) {
      fetchStats();
    }
    const interval = setInterval(fetchStats, delay);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, isLoading]);

  useEffect(() => {
    function fetchChartData() {
      asyncFetch(`${config?.backendUrl}charts/latest`)
        .then(
          (data: {
            body: {
              charts: { date: string; near_price: string; txns: string }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.charts;
            if (data.status === 200) {
              setCharts(resp);
            } else {
              handleRateLimit(data, fetchChartData);
            }
          },
        )
        .catch(() => {});
    }
    if (config?.backendUrl) {
      fetchChartData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.backendUrl]);

  const chartData = useMemo(() => {
    try {
      const series = charts?.map((stat) => ({
        y: Number(stat.txns),
        date: stat.date,
        price: stat.near_price,
      }));
      series.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const categories = series.map((stat) => formatCustomDate(stat.date));
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
    // Factory function to create the tooltip formatter

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
        ] as [ChartSeriesInfo],
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
  }, [chartData, theme]);

  const iframeSrc = `
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
    `;
  const nearPrice = stats?.near_price ?? '';
  const nearBtcPrice = stats?.near_btc_price ?? '';
  const change24 = stats?.change_24 ?? '';
  const totalTxns = stats?.total_txns ?? 0;
  return (
    <div className="container mx-auto px-3">
      <div className="bg-white soft-shadow rounded-xl overflow-hidden px-5 md:py lg:px-0  dark:bg-black-600">
        <div
          className={`grid grid-flow-col grid-cols-1 ${
            network === 'mainnet'
              ? 'grid-rows-3 lg:grid-cols-3'
              : 'grid-rows-2 lg:grid-cols-2'
          } lg:grid-rows-1 divide-y lg:divide-y-0 lg:divide-x lg:py-3 dark:divide-black-200`}
        >
          {network === 'mainnet' && (
            <>
              <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y  lg:divide-x-0 dark:divide-black-200 md:pt-0 md:pb-0 md:px-5">
                <div className="flex flex-row py-5 lg:pb-5 lg:px-0">
                  <div className="items-center flex justify-left mr-3 ">
                    <img
                      src={`${config.appUrl}images/${
                        theme === 'dark'
                          ? 'near price_dark.svg'
                          : 'near price.svg'
                      }`}
                      alt={t ? t('home:nearPrice') : 'nearPrice'}
                      width="24"
                      height="24"
                    />
                  </div>
                  <div className="ml-2">
                    <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm ">
                      {t ? t('home:nearPrice') : 'NEAR PRICE'}
                    </p>
                    {isLoading ? (
                      <Skeleton className="my-1 h-4" />
                    ) : (
                      <Link
                        href="/charts/near-price"
                        className="hover:no-underline flex items-center"
                      >
                        <a className="leading-6 text-nearblue-600 dark:text-neargray-10 hover:no-underline px-1 ">
                          {nearPrice ? '$' + dollarFormat(nearPrice) : ''}
                          <span className="text-nearblue-700">
                            {nearBtcPrice
                              ? '@ ' +
                                localFormat(stats?.near_btc_price) +
                                ' BTC'
                              : ''}
                          </span>
                        </a>
                        {change24 && (
                          <>
                            {Number(stats?.change_24) > 0 ? (
                              <span className="text-neargreen text-sm">
                                {stats?.change_24
                                  ? '(' + dollarFormat(stats?.change_24) + '%)'
                                  : stats?.change_24 ?? ''}
                              </span>
                            ) : (
                              <span className="text-red-500 text-sm">
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
                    <img
                      src={`${config.appUrl}images/${
                        theme === 'dark' ? 'market_dark.svg' : 'market.svg'
                      }`}
                      alt={t ? t('home:marketCap') : 'marketCap'}
                      width="24"
                      height="24"
                    />
                  </div>
                  <div className="ml-2">
                    <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                      {t ? t('home:marketCap') : ' MARKET CAP'}
                    </p>
                    {isLoading ? (
                      <Skeleton className="my-1 h-4" />
                    ) : (
                      <>
                        <Link
                          href="/charts/market-cap"
                          className="hover:no-underline"
                        >
                          <a className="leading-6 text-nearblue-700 hover:no-underline">
                            {stats?.market_cap
                              ? '$' + dollarFormat(stats?.market_cap ?? 0)
                              : ''}
                          </a>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:pb-0 md:px-5">
            <div className="flex flex-row justify-between py-5 lg:pb-5 lg:px-0">
              <div className="flex flex-row ">
                <div className="items-center flex justify-left mr-3 ">
                  <img
                    src={`${config.appUrl}images/${
                      theme === 'dark'
                        ? 'transactions_dark.svg'
                        : 'transactions.svg'
                    }`}
                    alt={t ? t('home:transactions') : 'transactions'}
                    width="24"
                    height="24"
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                    {t ? t('home:transactions') : 'TRANSACTIONS'}
                  </p>
                  {isLoading ? (
                    <Skeleton className="my-1 h-4" />
                  ) : (
                    <div className="flex flex-row">
                      <p className="leading-6 text-nearblue-600 dark:text-neargray-10 mr-0.5">
                        {totalTxns ? currency(stats?.total_txns) : ''}
                      </p>
                      <p className="leading-6 text-nearblue-700">
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <div>
                                {stats?.tps ? `(${stats?.tps} TPS)` : ''}
                              </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                              align="start"
                              side="bottom"
                            >
                              Transactions per second
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col text-right">
                <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                  {' '}
                  {t ? t('home:gasPrice') : 'GAS PRICE'}
                </p>
                {isLoading ? (
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
                  <img
                    src={`${config.appUrl}images/${
                      theme === 'dark' ? 'pickaxe_dark.svg' : 'pickaxe.svg'
                    }`}
                    alt={t ? t('home:activeValidator') : 'activeValidator'}
                    width="24"
                    height="24"
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                    <Link href="/node-explorer" className="hover:no-underline">
                      {' '}
                      {t ? t('home:activeValidator') : 'ACTIVE VALIDATORS'}{' '}
                    </Link>
                  </p>
                  {isLoading ? (
                    <Skeleton className="my-1 h-4" />
                  ) : (
                    <Link href="/node-explorer" className="hover:no-underline">
                      <a className="leading-6 text-nearblue-700 hover:no-underline">
                        {stats?.nodes_online
                          ? localFormat(stats?.nodes_online)
                          : stats?.nodes_online ?? ''}
                      </a>
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-col text-right">
                <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                  {t ? t('home:avgBlockTime') : 'AVG. BLOCK TIME'}
                </p>
                {isLoading ? (
                  <Skeleton className="my-1 h-4" />
                ) : (
                  <Link href="/charts/blocks" className="hover:no-underline">
                    <a className="leading-6 text-nearblue-700 hover:no-underline">
                      {stats?.avg_block_time
                        ? `${
                            (stats?.avg_block_time).replace(/\.?0+$/, '') + ' s'
                          }`
                        : ''}
                    </a>
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-1 flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:px-5">
            <div className="flex-1 py-5 lg:px-0">
              <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                {' '}
                {t
                  ? t('home:transactionHistory', { days: 14 })
                  : 'NEAR TRANSACTION HISTORY IN 14 DAYS'}
              </p>
              <div className="mt-1 h-28 dark:bg-black-600">
                {chartData ? (
                  <iframe
                    allowTransparency={true}
                    srcDoc={iframeSrc}
                    style={{
                      width: '100%',
                      border: 'none',
                      backgroundColor: theme === 'dark' ? '#0D0D0D' : '#ffff',
                      paddingRight: '20px',
                    }}
                  />
                ) : (
                  <Skeleton className="h-28" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
