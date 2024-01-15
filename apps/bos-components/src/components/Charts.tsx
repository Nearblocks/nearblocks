/**
 * Component: Charts
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Charts component for Near Charts & Statistics
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [chartTypes] - Type of chart to be shown, available options are (price, blocks, txns etc)
 * @param {boolean} [fetchStyles] - Use Nearblocks styles in the component
 * @param {boolean} [poweredBy] - Powered by attribution

 */

interface Props {
  chartTypes: string;
  fetchStyles?: boolean;
  poweredBy?: boolean;
  network: string;
}

import Skeleton from '@/includes/Common/Skeleton';
import { getConfig, yoctoToNear } from '@/includes/libs';
import { ChartConfig, ChartStat, ChartTypeInfo } from '@/includes/types';

export default function (props: Props) {
  const [css, setCss] = useState({});
  const [data, setData] = useState<ChartStat[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [chartInfo, setChartInfo] = useState<ChartTypeInfo>({
    title: '',
    description: '',
  });

  const config = getConfig(props.network);

  const charts = [
    {
      link: '/charts/near-price',
      text: 'Near Daily Price (USD) Chart',
      image: `${config.appUrl}images/charts/near-price.svg`,
      exclude: `${props.network}` === 'testnet',
    },
    {
      link: '/charts/market-cap',
      text: 'Near Market Capitalization Chart',
      image: `${config.appUrl}images/charts/market-cap.svg`,
      exclude: `${props.network}` === 'testnet',
    },
    {
      link: '/charts/near-supply',
      text: 'Near Supply Growth Chart',
      image: `${config.appUrl}images/charts/near-supply.svg`,
      exclude: false,
    },
    {
      link: '/charts/txns',
      text: 'Near Daily Transactions Chart',
      image: `${config.appUrl}images/charts/txns.svg`,
      exclude: false,
    },
    {
      link: '/charts/blocks',
      text: 'Near Block Count',
      image: `${config.appUrl}images/charts/blocks.svg`,
      exclude: false,
    },
    {
      link: '/charts/addresses',
      text: 'Near Unique Accounts Chart',
      image: `${config.appUrl}images/charts/addresses.svg`,
      exclude: false,
    },
    {
      link: '/charts/txn-fee',
      text: 'Transaction Fee Chart',
      image: `${config.appUrl}images/charts/txn-fee.svg`,
      exclude: `${props.network}` === 'testnet',
    },
    {
      link: '/charts/txn-volume',
      text: 'Transaction Volume Chart',
      image: `${config.appUrl}images/charts/txn-volume.svg`,
      exclude: `${props.network}` === 'testnet',
    },
  ];

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

  const chartData = useMemo(() => {
    try {
      const chartTypeMappings = {
        txns: (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.txns),
          date: stat.date,
          blocks: stat.blocks,
          addresses: stat.addresses,
        }),
        'market-cap': (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.market_cap),
          date: stat.date,
          price: Number(stat.near_price),
        }),
        'near-supply': (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(yoctoToNear(Number(stat.total_supply), false)),
          date: stat.date,
        }),
        blocks: (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.blocks),
          date: stat.date,
        }),
        addresses: (stat: ChartStat) => ({
          x: new Date(stat.date).valueOf(),
          y: Number(stat.total_addresses),
          date: stat.date,
          addresses: stat.addresses,
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
        chartTypeMappings[props.chartTypes as keyof typeof chartTypeMappings];
      if (mappingFunction) {
        return data.map(mappingFunction);
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }, [data, props.chartTypes]);

  useEffect(() => {
    function fetchChartData() {
      asyncFetch(`${config.backendUrl}charts`).then(
        (res: { body: { charts: ChartStat[] } }) => {
          if (res?.body) {
            setData(res.body?.charts as ChartStat[]);
          }
        },
      );
    }

    if (props?.fetchStyles) {
      fetchStyles();
    }

    fetchChartData();
  }, [props?.fetchStyles, config.backendUrl]);

  useEffect(() => {
    const fetchData = () => {
      let titleText = '';
      let yLabel = '';
      let description = '';
      switch (props.chartTypes) {
        case 'market-cap':
          titleText = 'Near Market Capitalization Chart';
          yLabel = 'Near Market Cap (USD)';
          description =
            'tNear Market Capitalization chart shows the historical breakdown of Near daily market capitalization and price.';
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
          titleText = 'Near Block Count';
          yLabel = 'Blocks per Day';
          description =
            'Near Block Count Chart shows the historical number of blocks produced daily on Near blockchain.';
          break;
        case 'addresses':
          titleText = 'Near Unique Accounts Chart';
          yLabel = 'Near Cumulative Accounts Growth';
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
        },
        title: {
          text: titleText,
        },
        subtitle: {
          text: 'Source: NearBlocks.io',
        },
        xAxis: {
          type: 'datetime',
        },
        yAxis: {
          title: {
            text: yLabel,
          },
        },
        legend: {
          enabled: false,
        },
        series: [
          {
            type: 'area',
            data: chartData,
            color: 'rgba(3, 63, 64, 1)',
          },
        ],
        credits: {
          enabled: false,
        },
        plotOptions: {
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
  }, [chartData, props.chartTypes]);

  const iframeSrc = `
  <html>
    <head>
      <script src="https://code.highcharts.com/highcharts.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/dayjs@1.10.4"></script>
      <script src="https://cdn.jsdelivr.net/npm/numeral@2.0.6/numeral.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/big.js@5.2.2"></script>
    </head>
    <body>
      <div id="chart-container" style="width: 100%; height: 100%;"></div>
      ${
        props.poweredBy
          ? '<p style="text-align: center; color: #000; font-size: 0.75rem; padding-top: 1rem; padding-bottom: 1rem; font-family: sans-serif;">Powered by <a href="https://beta.nearblocks.io/?utm_source=bos_widget&utm_medium=Charts" target="_blank" style="font-weight: 600; font-family: sans-serif; color: #000; text-decoration: none;">NearBlocks</a></p>'
          : ''
      }
      <script type="text/javascript">
        const chartConfig = ${JSON.stringify(chartConfig)};
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

            switch ("${props.chartTypes}") {
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
                      Total Sypply: <strong>\${dollarFormat(item.y)} Ⓝ</strong>
                    \`;
                  break;
                case "blocks":
                    tooltipContent = \`
                      \${dayjs(item.date).format('dddd, MMMM DD, YYYY')}<br/>
                      Total Blocks: <strong>\${dollarFormat(item.y)}</strong>\`;
                  break;
                case "addresses":
                    tooltipContent = \`
                      \${dayjs(item.date).format('dddd, MMMM DD, YYYY')}<br/>
                      Total Blocks: <strong>\${dollarFormat(item.y)}</strong>
                      \`;
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
`;
  const Theme = styled.div`
    ${css}
  `;

  return (
    <Theme>
      <div>
        <div className="bg-hero-pattern h-56">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:sm:text-2xl text-xl text-white">
              {props.chartTypes ? chartInfo.title : 'Near Charts & Statistics'}
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-3 -mt-36">
          {props.chartTypes && (
            <div
              className="block bg-white border soft-shadow rounded-lg overflow-hidden mb-10"
              style={{ height: 580 }}
            >
              <p className="leading-7 px-4 text-sm py-4 text-gray-500 border-b">
                {chartInfo?.description}
              </p>
              <div className="pl-2 pr-2 py-8 h-full">
                {chartData?.length ? (
                  <iframe
                    srcDoc={iframeSrc}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                ) : (
                  <Skeleton className="h-[93%] w-full" />
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {charts.map(
              (chart, index) =>
                chart.exclude === false && (
                  <div
                    key={index}
                    className="block bg-white border soft-shadow rounded-lg overflow-hidden"
                  >
                    <a
                      href={chart.link}
                      className="block leading-7 p-3 text-sm text-gray-500 border-b truncate"
                    >
                      <h2>{chart.text}</h2>
                    </a>
                    <div className="pl-2 pr-4 py-6">
                      <a href={chart.link}>
                        <img
                          src={chart.image}
                          alt={chart.text}
                          width={600}
                          height={550}
                        />
                      </a>
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      </div>
    </Theme>
  );
}
