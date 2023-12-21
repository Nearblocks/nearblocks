/**
 * Component: Transactions Overview
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Transactions Overview.
 * @interface Props
 * @param {boolean} [fetchStyles] - Use Nearblock styles.
 * @param {string} [network] - Identifies the network by specifying its identifier.
 *                             Example: network=testnet, which identifies the currently used testnet.
 */

interface Props {
  fetchStyles?: boolean;
  network: string;
}

import Skelton from '@/includes/Common/Skelton';
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

export default function (props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [css, setCss] = useState({});
  const [stats, setStats] = useState<StatusInfo>({} as StatusInfo);
  const [charts, setCharts] = useState<ChartInfo[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfigType>(
    {} as ChartConfigType,
  );

  const config = getConfig(props.network);

  /**
   * Fetches styles asynchronously from a nearblocks gateway.
   */
  function fetchStyles() {
    asyncFetch('https://beta.nearblocks.io/common.css').then(
      (res: { body: string }) => {
        if (res?.body) {
          setCss(res.body);
        }
      },
    );
  }

  const Theme = styled.div`
    ${css}
  `;

  useEffect(() => {
    let delay = 15000;
    let retries = 0;

    function fetchStats() {
      setIsLoading(true);
      asyncFetch(`${config?.backendUrl}stats`)
        .then((data: { body: { stats: StatusInfo[] } }) => {
          const resp = data?.body?.stats?.[0];
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
        })
        .catch((error: any) => {
          if (error.response && error.response.status === 429) {
            delay = Math.min(2 ** retries * 15000, 60000);
            retries++;
          }
        });
      setIsLoading(false);
    }

    fetchStats();

    const interval = setInterval(fetchStats, delay);

    return () => clearInterval(interval);
  }, [config?.backendUrl]);

  useEffect(() => {
    if (props?.fetchStyles) {
      fetchStyles();
    }

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
  }, [props?.fetchStyles, config.backendUrl]);

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
    <Theme>
      <div className="relative -mt-14">
        <div className="container mx-auto px-3">
          <div className="bg-white soft-shadow rounded-lg overflow-hidden px-5 md:py lg:px-0">
            <div
              className={`grid grid-flow-col grid-cols-1 ${
                props.network === 'mainnet'
                  ? 'grid-rows-3 lg:grid-cols-3'
                  : 'grid-rows-2 lg:grid-cols-2'
              } lg:grid-rows-1 divide-y lg:divide-y-0 lg:divide-x lg:py-3`}
            >
              {props.network === 'mainnet' && (
                <>
                  <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:pb-0 md:px-5">
                    <div className="flex flex-row py-5 lg:pb-5 lg:px-0">
                      <div className="items-center flex justify-left mr-3 ">
                        <img
                          src={`${config.appUrl}images/near price.svg`}
                          alt={'nearPrice'}
                          className="h-9 w-9"
                          width="24"
                          height="24"
                        />
                      </div>
                      <div className="ml-2">
                        <p className="uppercase font-semibold text-gray-600 text-sm ">
                          NEAR PRICE
                        </p>
                        {isLoading ? (
                          <Skelton />
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
                          alt={'marketCap'}
                          className="h-9 w-9"
                          width="24"
                          height="24"
                        />
                      </div>
                      <div className="ml-2">
                        <p className="uppercase font-semibold text-gray-500 text-sm">
                          MARKET CAP
                        </p>
                        {isLoading ? (
                          <Skelton />
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
                        alt={'transactions'}
                        className="h-9 w-9"
                        width="24"
                        height="24"
                      />
                    </div>
                    <div className="ml-2">
                      <p className="uppercase font-semibold text-gray-500 text-sm">
                        TRANSACTIONS
                      </p>
                      {isLoading ? (
                        <Skelton />
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
                      GAS PRICE
                    </p>
                    {isLoading ? (
                      <Skelton />
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
                        alt={'activeValidator'}
                        className="h-9 w-9"
                        width="24"
                        height="24"
                      />
                    </div>
                    <div className="ml-2">
                      <p className="uppercase font-semibold text-gray-500 text-sm">
                        ACTIVE VALIDATORS
                      </p>
                      {isLoading ? (
                        <Skelton />
                      ) : (
                        <a href="/charts/blocks">
                          <a className="leading-6 text-gray-400">
                            {localFormat(stats?.nodes_online ?? 0)}
                          </a>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <p className="uppercase font-semibold text-gray-500 text-sm">
                      AVG. BLOCK TIME
                    </p>
                    {isLoading ? (
                      <Skelton />
                    ) : (
                      <a className="leading-6 text-gray-400">
                        {stats?.avg_block_time ?? 0} s
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-1 flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:px-5">
                <div className="flex-1 lg:px-0">
                  <p className="uppercase font-semibold text-gray-500 text-sm">
                    {' '}
                    NEAR TRANSACTION HISTORY IN 14 DAYS
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
                      <Skelton className="h-full w-full" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-8 relative"></div>
      </div>
    </Theme>
  );
}
