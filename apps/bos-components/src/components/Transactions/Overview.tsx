/**
 * Component: TransactionsOverview
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Transactions Overview.
 * @interface Props
 * @property {Function} t - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [network] - The network data to show, either mainnet or testnet
 */

interface Props {
  network: string;
  t: (key: string, options?: { days?: number }) => string | undefined;
}

import Skeleton from '@/includes/Common/Skeleton';
import {
  currency,
  dollarFormat,
  formatCustomDate,
  localFormat,
} from '@/includes/formats';
import { getConfig } from '@/includes/libs';
import { gasPrice } from '@/includes/near';
import {
  ChartConfigType,
  StatusInfo,
  ChartInfo,
  ChartSeriesInfo,
} from '@/includes/types';

export default function ({ network, t }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatusInfo>({} as StatusInfo);
  const [charts, setCharts] = useState<ChartInfo[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfigType>(
    {} as ChartConfigType,
  );

  const config = getConfig(network);

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
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isLoading) setIsLoading(false);
        });
    }

    fetchStats();

    const interval = setInterval(fetchStats, delay);

    return () => clearInterval(interval);
  }, [config?.backendUrl, isLoading]);

  useEffect(() => {
    function fetchChartData() {
      asyncFetch(`${config.backendUrl}charts/latest`)
        .then(
          (data: {
            body: {
              charts: { date: string; near_price: string; txns: string }[];
            };
          }) => {
            const resp = data?.body?.charts;
            setCharts(resp);
          },
        )
        .catch(() => {});
    }

    fetchChartData();
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
          },
          categories: chartData.categories,
        },
        yAxis: {
          gridLineWidth: 0,
          title: {
            text: null,
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
  }, [chartData]);

  const iframeSrc = `
      <html>
        <head>
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

  return (
    <div className="container mx-auto px-3">
      <div className="bg-white soft-shadow rounded-lg overflow-hidden px-5 md:py lg:px-0">
        <div
          className={`grid grid-flow-col grid-cols-1 ${
            network === 'mainnet'
              ? 'grid-rows-3 lg:grid-cols-3'
              : 'grid-rows-2 lg:grid-cols-2'
          } lg:grid-rows-1 divide-y lg:divide-y-0 lg:divide-x lg:py-3`}
        >
          {network === 'mainnet' && (
            <>
              <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:pb-0 md:px-5">
                <div className="flex flex-row py-5 lg:pb-5 lg:px-0">
                  <div className="items-center flex justify-left mr-3 ">
                    <img
                      src={`${config.appUrl}images/near price.svg`}
                      alt={t ? t('home:nearPrice') : 'nearPrice'}
                      width="24"
                      height="24"
                    />
                  </div>
                  <div className="ml-2">
                    <p className="uppercase font-semibold text-gray-600 text-sm ">
                      {t ? t('home:nearPrice') : 'NEAR PRICE'}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-4" />
                    ) : (
                      <a href="/charts/near-price">
                        <a className="leading-6 text-gray-500">
                          ${dollarFormat(stats?.near_price ?? 0)}{' '}
                          <span className="text-gray-400">
                            @{localFormat(stats?.near_btc_price ?? 0)} BTC
                          </span>{' '}
                          {stats?.change_24 > 0 ? (
                            <span className="text-neargreen text-sm">
                              ({dollarFormat(stats?.change_24)}%)
                            </span>
                          ) : (
                            <span className="text-red-500 text-sm">
                              ({dollarFormat(stats?.change_24)}%)
                            </span>
                          )}
                        </a>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-row py-5 lg:pt-5 lg:px-0">
                  <div className="items-center flex justify-left mr-3 ">
                    <img
                      src={`${config.appUrl}images/market.svg`}
                      alt={t ? t('home:marketCap') : 'marketCap'}
                      width="24"
                      height="24"
                    />
                  </div>
                  <div className="ml-2">
                    <p className="uppercase font-semibold text-gray-500 text-sm">
                      {t ? t('home:marketCap') : ' MARKET CAP'}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-4" />
                    ) : (
                      <a href="/charts/market-cap">
                        <a className="leading-6 text-gray-400">
                          ${dollarFormat(stats?.market_cap ?? 0)}
                        </a>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:pb-0 md:px-5">
            <div className="flex flex-row justify-between py-5 lg:pb-5 lg:px-0">
              <div className="flex flex-row ">
                <div className="items-center flex justify-left mr-3 ">
                  <img
                    src={`${config.appUrl}images/transactions.svg`}
                    alt={t ? t('home:transactions') : 'transactions'}
                    width="24"
                    height="24"
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-gray-500 text-sm">
                    {t ? t('home:transactions') : 'TRANSACTIONS'}
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-4" />
                  ) : (
                    <p className="leading-6 text-gray-400">
                      {currency(Number(stats?.total_txns ?? 0))}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col text-right">
                <p className="uppercase font-semibold text-gray-500 text-sm">
                  {' '}
                  {t ? t('home:gasPrice') : 'GAS PRICE'}
                </p>
                {isLoading ? (
                  <Skeleton className="h-4" />
                ) : (
                  <p className="leading-6 text-gray-400">
                    {gasPrice(Number(stats?.gas_price ?? 0))}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-row justify-between align-center py-5 lg:pt-5 lg:px-0">
              <div className="flex flex-row ">
                <div className="items-center flex justify-left mr-3 ">
                  <img
                    src={`${config.appUrl}images/pickaxe.svg`}
                    alt={t ? t('home:activeValidator') : 'activeValidator'}
                    width="24"
                    height="24"
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-gray-500 text-sm">
                    {t ? t('home:activeValidator') : 'ACTIVE VALIDATORS'}
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-4" />
                  ) : (
                    <a href="/node-explorer">
                      <a className="leading-6 text-gray-400">
                        {localFormat(stats?.nodes_online ?? 0)}
                      </a>
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col text-right">
                <p className="uppercase font-semibold text-gray-500 text-sm">
                  {t ? t('home:avgBlockTime') : 'AVG. BLOCK TIME'}
                </p>
                {isLoading ? (
                  <Skeleton className="h-4" />
                ) : (
                  <a href="/charts/blocks">
                    <a className="leading-6 text-gray-400">
                      {stats?.avg_block_time ?? 0} s
                    </a>
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-1 flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:px-5">
            <div className="flex-1 lg:px-0">
              <p className="uppercase font-semibold text-gray-500 text-sm">
                {' '}
                {t
                  ? t('home:transactionHistory', { days: 14 })
                  : 'NEAR TRANSACTION HISTORY IN 14 DAYS'}
              </p>
              <div className="pl-2 pr-4 h-full">
                {chartData ? (
                  <iframe
                    srcDoc={iframeSrc}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                ) : (
                  <Skeleton className="h-36" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
