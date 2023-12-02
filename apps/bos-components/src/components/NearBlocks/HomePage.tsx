/**
 * Component : Home Page
 * License : Business Source License 1.1
 * Description:  Empowering insight into NEAR Protocol's real-time metrics, including price, market cap, transactions, gas prices, active validators, and recent transaction history, providing a comprehensive overview of its blockchain network.
 * @interface Props
 * @param {boolean} [useStyles] - Flag indicating whether to apply default gateway styles; when set to `true`, the component uses default styles, otherwise, it allows for custom styling.
 */
interface Props {
  useStyles?: boolean;
}

// import Skelton from '@/includes/Common/Skelton';
import {
  // currency,
  // dollarFormat,
  formatCustomDate,
  // localFormat,
} from '@/includes/formats';
import { getConfig } from '@/includes/libs';
// import { gasPrice } from '@/includes/near';
import {
  ChartConfigType,
  StatusInfo,
  ChartInfo,
  ChartSeriesInfo,
} from '@/includes/types';

export default function (props: Props) {
  const [_isLoading, setIsLoading] = useState(false);
  const [css, setCss] = useState({});
  const [_stats, setStats] = useState<StatusInfo>({} as StatusInfo);
  const [charts, setCharts] = useState<ChartInfo[]>([]);
  const [_chartConfig, setChartConfig] = useState<ChartConfigType>(
    {} as ChartConfigType,
  );

  const config = getConfig(context.networkId);

  function fetchStyle() {
    asyncFetch(
      'https://nearblocks.io/_next/static/css/4acfc667ed910a4e.css',
    ).then((res: { body: string }) => {
      if (res?.body) {
        setCss(res.body);
      }
    });
  }

  const Theme = styled.div`
    ${css}
  `;

  useEffect(() => {
    function fetchStats() {
      setIsLoading(true);
      asyncFetch(`${config?.backendUrl}stats`)
        .then(
          (data: {
            body: {
              stats: StatusInfo[];
            };
          }) => {
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
          },
        )
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }

    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);

    return () => clearInterval(interval);
  }, [config?.backendUrl]);

  useEffect(() => {
    if (props?.useStyles) {
      fetchStyle();
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
  }, [props?.useStyles]);

  //@ts-ignore
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

  // const iframeSrc = `
  //   <html>
  //     <head>
  //       <script src="https://code.highcharts.com/highcharts.js"></script>
  //       <script src="https://cdn.jsdelivr.net/npm/dayjs@1.10.4"></script>
  //       <script src="https://cdn.jsdelivr.net/npm/numeral@2.0.6/numeral.min.js"></script>
  //     </head>
  //     <body>
  //       <div id="chart-container" style="width: 100%; height: 100%;"></div>
  //       <script type="text/javascript">
  //         const chartConfig = ${JSON.stringify(chartConfig)};
  //         chartConfig.tooltip = {
  //           formatter: function () {
  //             const item= this.point
  //             function dollarFormat(value) {
  //               return numeral(value).format('0,0.00');
  //              }
  //              return \`<span style="font-size:10px">\${dayjs(this.point.date).format(
  //                'dddd, MMMM DD, YYYY'
  //              )}</span><br/>Transactions: <strong>\${dollarFormat(
  //              this.point.y
  //            )}</strong><br/>Price: $\${dollarFormat(this.point.price)}
  //            \`;
  //           }
  //         };
  //         Highcharts.chart('chart-container', chartConfig);
  //       </script>
  //     </body>
  //   </html>
  // `;

  return (
    <Theme>
      <div className="relative -mt-14">
        <div className="py-8 relative"></div>
        <div className="py-8 relative"></div>
        <div className="container mx-auto px-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="w-full">
              <div className="bg-white soft-shadow rounded-lg overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b p-3 text-gray-500 text-sm font-semibold">
                  Latest Blocks
                </h2>
                {
                  <Widget
                    src={`${config.ownerId}/widget/bos-components.components.Shared.LatestBlocks`}
                  />
                }
              </div>
            </div>
            <div className="w-full">
              <div className="bg-white soft-shadow rounded-lg overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b p-3 text-gray-500 text-sm font-semibold">
                  Latest Transactions
                </h2>
                {
                  <Widget
                    src={`${config.ownerId}/widget/bos-components.components.Shared.LatestTransactions`}
                  />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </Theme>
  );
}
