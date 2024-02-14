/**
 * Component: NodeExplorer
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Node validator on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 * @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 */

interface Props {
  network: string;
  currentPage: number;
  setPage: (page: number) => void;
}
import Skeleton from '@/includes/Common/Skeleton';
import { formatNumber, formatWithCommas } from '@/includes/formats';
import {
  convertAmountToReadableString,
  convertTimestampToTime,
  getConfig,
  shortenAddress,
  timeAgo,
  yoctoToNear,
} from '@/includes/libs';
import { ValidatorFullData } from '@/includes/types';
import ArrowDown from '@/includes/icons/ArrowDown';
import { ValidatorEpochData } from 'nb-types';
import Question from '@/includes/icons/Question';
const initialValidatorFullData = {
  validatorEpochData: [],
  currentValidators: 0,
  totalStake: 0,
  seatPrice: 0,
  elapsedTime: 0,
  totalSeconds: 0,
  epochProgress: 0,
  validatorTelemetry: {},
  total: 0,
};

export default function ({ network, currentPage, setPage }: Props) {
  const [validatorFullData, setValidatorFullData] = useState<{
    [key: number]: ValidatorFullData;
  }>(initialValidatorFullData);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSuppy, setTotalSupply] = useState('');
  const [totalCount, setTotalCount] = useState('');
  const [expanded, setExpanded] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [latestBlock, setLatestBlock] = useState(0);
  const errorMessage = 'No validator data!';
  const config = getConfig(network);

  const TotalSupply = totalSuppy ? yoctoToNear(totalSuppy, false) : '';

  useEffect(() => {
    function fetchValidatorData(page: number) {
      setIsLoading(true);
      asyncFetch(`${config?.backendUrl}validators?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res: any) => {
          const data = res.body;
          if (res.status === 200) {
            setTimeRemaining(data?.totalSeconds ?? 0);
            const validators = {
              validatorEpochData: data?.validatorFullData ?? [],
              currentValidators: data?.currentValidators,
              totalStake: data?.totalStake ?? 0,
              seatPrice: data?.epochStatsCheck ?? [],
              elapsedTime: data?.elapsedTimeData ?? 0,
              totalSeconds: data?.totalSeconds ?? 0,
              epochProgress: data?.epochProgressData ?? 0,
              validatorTelemetry: data?.validatorTelemetry ?? [],
              total: data?.total,
            };
            setValidatorFullData((prevData) => ({
              ...prevData,
              [page]: validators || [],
            }));
          }
          setExpanded([]);
        })
        .catch(() => {})

        .finally(() => {
          setIsLoading(false);
        });
    }
    function fetchTotalSuppy() {
      asyncFetch(`${config?.backendUrl}stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res: any) => {
          const data = res.body;
          if (res.status === 200) {
            setTotalSupply(data.stats[0].total_supply || 0);
          }
        })
        .catch(() => {})
        .finally(() => {});
    }
    function fetchLatestBlock() {
      asyncFetch(`${config?.backendUrl}blocks/latests?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res: any) => {
          const data = res.body;
          if (res.status === 200) {
            setLatestBlock(data.blocks[0].block_height || 0);
          }
        })
        .catch(() => {})
        .finally(() => {});
    }
    fetchLatestBlock();
    fetchTotalSuppy();
    fetchValidatorData(currentPage);
  }, [config?.backendUrl, currentPage]);
  validatorFullData[currentPage]?.total
    ? setTotalCount(validatorFullData[currentPage]?.total)
    : '';
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeRemaining((prevTimeRemaining) => prevTimeRemaining - 1);
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleRowClick = (rowIndex: number) => {
    const isRowExpanded = expanded.includes(rowIndex);

    if (isRowExpanded) {
      setExpanded((prevExpanded) =>
        prevExpanded.filter((index) => index !== rowIndex),
      );
    } else {
      setExpanded((prevExpanded) => [...prevExpanded, rowIndex]);
    }
  };

  const stakingStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'joining':
        return 'Joining';

      case 'leaving':
        return 'Kickout';
      case 'proposal':
        return 'Proposal';
      case 'idle':
        return 'idle';

      case 'newcomer':
        return 'Newcomer';
      case 'onHold':
        return 'On hold';
      default:
        return;
    }
  };
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'active':
        return {
          textColor: 'text-emerald-500',
          bgColor: 'bg-emerald-50 text-emerald-500',
        };
      case 'joining':
        return {
          textColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50 text-yellow-500',
        };
      case 'leaving':
        return {
          textColor: 'text-red-500',
          bgColor: 'bg-red-50 text-red-500',
        };
      case 'proposal':
        return {
          textColor: 'text-teal-900',
          bgColor: 'bg-teal-300 text-teal-900',
        };
      case 'idle':
        return {
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-300 text-gray-600',
        };
      case 'newcomer':
        return {
          textColor: 'text-orange-500',
          bgColor: 'bg-orange-500 text-white',
        };
      case 'onHold':
        return {
          textColor: 'text-blue-500',
          bgColor: 'bg-blue-500 text-white',
        };
      default:
        return {};
    }
  };

  const columns = [
    {
      header: <span></span>,
      key: '',
      cell: (row: ValidatorEpochData) => (
        <button onClick={() => handleRowClick(row.index || 0)}>
          <ArrowDown
            className={`${row.isExpanded ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
      ),
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>Status</span>,
      key: 'View',
      cell: (row: ValidatorEpochData) => (
        <div
          className={`inline-block ${
            getStatusColorClass(row?.stakingStatus ?? '').bgColor
          } rounded-xl p-1 text-center`}
        >
          <div>{stakingStatusLabel(row?.stakingStatus ?? '')}</div>
        </div>
      ),
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>VALIDATOR</span>,
      key: 'accountId',
      cell: (row: ValidatorEpochData) => (
        <>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <a
                  href={`/address/${row.accountId}`}
                  className="hover:no-underline"
                >
                  <a className="text-green-500 hover:no-underline">
                    {shortenAddress(row.accountId)}
                  </a>
                </a>
              </Tooltip.Trigger>
              <Tooltip.Content
                className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="top"
              >
                {row.accountId}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div>{row.publicKey ? shortenAddress(row.publicKey) : ''}</div>
              </Tooltip.Trigger>
              <Tooltip.Content
                className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {row.publicKey}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </>
      ),
      tdClassName: 'pl-6 py-4 text-sm text-nearblue-600 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>FEE</span>,
      key: 'poolInfo',
      cell: (row: ValidatorEpochData) => (
        <div>
          {row?.poolInfo?.fee !== undefined
            ? `${(
                (row?.poolInfo?.fee!.numerator /
                  row?.poolInfo?.fee!.denominator) *
                100
              ).toFixed(0)}%`
            : 'N/A'}
        </div>
      ),
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },

    {
      header: <span>DELEGATORS</span>,
      key: 'deligators',
      cell: (row: ValidatorEpochData) => {
        return (
          <div>
            {row?.poolInfo?.delegatorsCount !== undefined &&
            row.poolInfo.delegatorsCount !== null
              ? formatWithCommas(row.poolInfo.delegatorsCount.toString())
              : 'N/A'}
          </div>
        );
      },
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>TOTAL STAKE</span>,
      key: 'stake',
      cell: (row: ValidatorEpochData) => (
        <span>
          {formatWithCommas(
            (row.currentEpoch?.stake ??
              row.nextEpoch?.stake ??
              row.afterNextEpoch?.stake ??
              `${row.contractStake}`)!.substring(0, 8),
          )}
          Ⓝ
        </span>
      ),
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>STAKE %</span>,
      key: 'percentage',
      cell: (row: ValidatorEpochData) => {
        return <div>{row?.percent}%</div>;
      },
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>CUMULATIVE STAKE</span>,
      key: 'cumulative_stake',
      cell: (row: ValidatorEpochData) => {
        return (
          <div>
            <div className="relative w-50 h-7 soft-shadow rounded-xl overflow-hidden bg-gray-300">
              <div
                className="absolute top-0 left-0 right-0 bottom-0 h-full bg-green-500 text-center flex items-center justify-center"
                style={{
                  width: `${row?.cumulativeStake?.cumulativePercent || 0}%`,
                }}
              ></div>
              <span className="absolute  text-white inset-0 flex items-center justify-center">
                {row?.cumulativeStake?.cumulativePercent
                  ? `${row?.cumulativeStake?.cumulativePercent}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        );
      },
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>STAKE CHANGE (24H)</span>,
      key: '24_change',
      cell: (row: ValidatorEpochData) => {
        if (!row?.stakeChange?.value) {
          const visibleStake =
            row?.currentEpoch?.stake ??
            row?.nextEpoch?.stake ??
            row?.afterNextEpoch?.stake ??
            row?.contractStake;
          if (visibleStake) {
            return `${convertAmountToReadableString(
              visibleStake,
              'seatPriceAmount',
            )}  Ⓝ`;
          }
          return null;
        }
        return (
          <div
            className={`flex ${
              row?.stakeChange.symbol === '+'
                ? 'text-neargreen'
                : 'text-red-500'
            }`}
          >
            <div>{row?.stakeChange?.symbol}</div>
            <p>{row?.stakeChange?.value} Ⓝ</p>
          </div>
        );
      },
      tdClassName: 'px-6 py-4  whitespace-nowrap text-sm text-nearblue-600 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
  ];

  const ExpandedRow = (row: ValidatorEpochData) => {
    const telemetry =
      validatorFullData[currentPage]?.validatorTelemetry[row.accountId];
    const progress = row?.currentEpoch?.progress;

    const productivityRatio = progress
      ? (progress.blocks.produced + progress.chunks.produced) /
        (progress.blocks.total + progress.chunks.total)
      : 0;
    return (
      <>
        <tr>
          <td colSpan={9} className="bg-gray-50">
            {telemetry && (
              <Widget
                src={`${config?.ownerId}/widget/bos-components.components.Shared.Table`}
                props={{
                  columns: [
                    {
                      header: (
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <div className="flex">
                                <div>Uptime</div>
                                <div>
                                  <Question className="w-4 h-4 fill-current ml-1" />
                                </div>
                              </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                              align="start"
                              side="top"
                            >
                              {
                                'Uptime is estimated by the ratio of the number of produced blocks to the number of expected blocks. '
                              }
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      ),
                      key: 'uptime',
                      cell: () => {
                        return (
                          <div className="text-black">
                            {productivityRatio * 100 == 100
                              ? 100
                              : (productivityRatio * 100).toFixed(3)}
                            %
                          </div>
                        );
                      },
                      tdClassName:
                        'px-5 whitespace-nowrap text-sm text-nearblue-600 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
                    },
                    {
                      header: (
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <div className="flex">
                                <div>Latest block</div>
                                <div>
                                  <Question className="w-4 h-4 fill-current ml-1" />
                                </div>
                              </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                              align="start"
                              side="top"
                            >
                              {
                                'The block height the validation node reported in the most recent telemetry heartbeat.'
                              }
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      ),
                      key: 'latest_block',
                      cell: () => {
                        return (
                          <div
                            className={
                              Math.abs(telemetry.lastHeight - latestBlock) >
                              1000
                                ? 'text-danger'
                                : Math.abs(telemetry.lastHeight - latestBlock) >
                                  50
                                ? 'text-warning'
                                : undefined
                            }
                          >
                            {telemetry?.lastHeight}
                          </div>
                        );
                      },
                      tdClassName:
                        'px-5 whitespace-nowrap text-sm text-nearblue-600 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
                    },
                    {
                      header: (
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <div className="flex">
                                <div>Latest Telemetry Update</div>
                                <div>
                                  <Question className="w-4 h-4 fill-current ml-1" />
                                </div>
                              </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                              align="start"
                              side="top"
                            >
                              {
                                'Telemetry is a regular notification coming from the nodes which includes generic information like the latest known block height, and the version of NEAR Protocol agent (nearcore).'
                              }
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      ),
                      key: 'telemetry',
                      cell: () => {
                        return (
                          <div className="text-black">
                            {telemetry?.lastSeen &&
                              timeAgo(telemetry?.lastSeen)}
                          </div>
                        );
                      },
                      tdClassName:
                        'px-5 whitespace-nowrap text-sm text-nearblue-600 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
                    },
                    {
                      header: (
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <div className="flex">
                                <div>Node Agent Name</div>
                                <div>
                                  <Question className="w-4 h-4 fill-current ml-1" />
                                </div>
                              </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                              align="start"
                              side="top"
                            >
                              {
                                'NEAR Protocol could have multiple implementations, so agent is the name of that implementation, where "near-rs" is.'
                              }
                              <a
                                href="https://github.com/near/nearcore"
                                target="_blank"
                                className="text-green-500 hover:no-underline"
                              >
                                the official implementation.
                              </a>
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      ),
                      key: 'agent_name',
                      cell: () => {
                        return (
                          <span className="text-black rounded bg-gray-300 px-1">
                            {telemetry?.agentName}{' '}
                          </span>
                        );
                      },
                      tdClassName:
                        'px-5 whitespace-nowrap text-sm text-nearblue-600 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
                    },
                    {
                      header: 'Node Agent Version / Build',
                      key: 'agent_version',
                      cell: () => {
                        return (
                          <span className="text-black rounded bg-gray-300 px-1">{`${telemetry?.agentVersion}/${telemetry?.agentBuild}`}</span>
                        );
                      },
                      tdClassName:
                        'px-5 whitespace-nowrap text-sm text-nearblue-600 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
                    },
                  ],
                  data: [telemetry] || [],
                  isLoading: false,
                  isPagination: false,
                  isExpanded: true,
                }}
              />
            )}
            {row?.description ? (
              <Widget
                src={`${config?.ownerId}/widget/bos-components.components.Shared.Table`}
                props={{
                  columns: [
                    {
                      header: 'Web',
                      key: 'web',
                      cell: (row: ValidatorEpochData) => {
                        return (
                          <div>
                            <a
                              className="text-green-500 hover:no-underline"
                              href={
                                row?.description?.url?.startsWith('http')
                                  ? row?.description?.url
                                  : `http://${row?.description?.url}`
                              }
                              rel="noreferrer noopener"
                              target="_blank"
                            >
                              {' '}
                              {row?.description?.url}
                            </a>
                          </div>
                        );
                      },
                      tdClassName:
                        'px-5 pb-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
                    },
                    {
                      header: 'Email',
                      key: 'email',
                      cell: (row: ValidatorEpochData) => {
                        return (
                          <div>
                            <a
                              className="text-green-500 hover:no-underline"
                              href={`mailto:${row?.description?.email}`}
                            >
                              {row?.description?.email}{' '}
                            </a>
                          </div>
                        );
                      },
                      tdClassName:
                        'pl-6 pb-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
                      thClassName:
                        'px-6 pt-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
                    },
                    row?.description?.twitter && {
                      header: 'Twitter',
                      key: 'twitter',
                      cell: (row: ValidatorEpochData) => {
                        return (
                          <div>
                            <a
                              className="text-green-500 hover:no-underline"
                              href={`https://twitter.com/${row?.description?.twitter}`}
                              rel="noreferrer noopener"
                              target="_blank"
                            >
                              {row?.description?.twitter}
                            </a>
                          </div>
                        );
                      },
                      tdClassName:
                        'px-2 pb-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
                      thClassName:
                        'px-2 pt-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
                    },
                    row?.description?.discord && {
                      header: 'Discord',
                      key: 'discord',
                      cell: (row: ValidatorEpochData) => {
                        return (
                          <div>
                            <a
                              className="text-green-500 hover:no-underline"
                              href={row?.description?.discord}
                              rel="noreferrer noopener"
                              target="_blank"
                            >
                              {row?.description?.discord}
                            </a>
                          </div>
                        );
                      },
                      tdClassName:
                        'px-5 pb-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
                    },
                    {
                      header: 'Description',
                      key: 'description',
                      cell: (row: ValidatorEpochData) => {
                        return (
                          <div className="text-gray-400 w-full">
                            <small>{row?.description?.description}</small>
                          </div>
                        );
                      },
                      tdClassName:
                        'px-5 pb-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
                    },
                  ],
                  data: [row] || [],
                  isLoading: false,
                  isPagination: false,
                  isExpanded: true,
                }}
              />
            ) : (
              <div className="flex justify-center text-sm text-nearblue-600 font-medium py-4 ">
                If you are node owner feel free to fill all &nbsp;
                <a
                  href="https://github.com/zavodil/near-pool-details#description"
                  className="text-green-500 hover:no-underline"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  data{' '}
                </a>
                &nbsp;to promote your own node!
              </div>
            )}
          </td>
        </tr>
      </>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
            <div>
              <h2 className=" flex justify-between border-b p-3 text-gray-600 text-sm font-semibold">
                <span>Staking Overview</span>
              </h2>
            </div>
            <div className="px-3 divide-y text-sm text-gray-600">
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Current Validators
                </div>
                <div className="w-full md:w-3/4 break-words">
                  {!validatorFullData[currentPage]?.currentValidators ? (
                    <Skeleton className="h-4 w-16 break-words" />
                  ) : (
                    validatorFullData[currentPage]?.currentValidators
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Total Staked
                </div>
                <div className="w-full md:w-3/4 break-words">
                  {!validatorFullData[currentPage]?.totalStake ? (
                    <Skeleton className="h-4 w-16 break-words" />
                  ) : (
                    convertAmountToReadableString(
                      validatorFullData[currentPage]?.totalStake,
                      'totalStakeAmount',
                    )
                  )}
                </div>
              </div>
              <div className="flex max-md:divide-y flex-col md:flex-row ">
                <div className="flex items-center justify-between md:w-1/2 py-4">
                  <div className="w-full mb-2 md:mb-0">Current Seat Price</div>
                  <div className="w-full break-words">
                    {!validatorFullData[currentPage]?.seatPrice ? (
                      <Skeleton className="h-4 w-16 break-words" />
                    ) : (
                      <>
                        {convertAmountToReadableString(
                          validatorFullData[currentPage]?.seatPrice,
                          'seatPriceAmount',
                        )}
                        Ⓝ
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between md:w-1/2 py-4">
                  <div className="w-full mb-2 md:mb-0">Total Supply</div>
                  <div className="w-full break-words">
                    {isLoading ? (
                      <Skeleton className="h-4 w-16 break-words" />
                    ) : (
                      <>
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <span>
                                {TotalSupply ? formatNumber(TotalSupply) : ''}
                              </span>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                              align="center"
                              side="top"
                            >
                              {totalSuppy + ' yoctoⓃ'}
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>{' '}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
            <h2 className="border-b p-3 text-gray-600 text-sm font-semibold">
              Epoch Information
            </h2>
            <div className="px-3 divide-y text-sm text-gray-600">
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                  Epoch Elapsed Time
                </div>
                <div className="w-full text-green-500 md:w-3/4 break-words">
                  {!validatorFullData[currentPage]?.elapsedTime ? (
                    <Skeleton className="h-3 w-32" />
                  ) : (
                    convertTimestampToTime(
                      validatorFullData[currentPage]?.elapsedTime,
                    )
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">ETA</div>
                <div className="w-full md:w-3/4 text-green-500 break-words">
                  {!validatorFullData[currentPage]?.totalSeconds ? (
                    <Skeleton className="h-3 w-32" />
                  ) : (
                    convertTimestampToTime(timeRemaining.toString())
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Progress</div>
                <div className="w-full md:w-3/4 break-words">
                  {!validatorFullData[currentPage]?.epochProgress ? (
                    <Skeleton className="h-3 w-full" />
                  ) : (
                    <div className="flex space-x-4 gap-2 items-center ">
                      <div className="bg-blue-900-15  h-2 w-full rounded-full">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${Big(
                              validatorFullData[currentPage]?.epochProgress,
                            ).toFixed(1)}%`,
                          }}
                        ></div>
                      </div>
                      {`${Big(
                        validatorFullData[currentPage]?.epochProgress,
                      ).toFixed(0)}%`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-5"></div>
      <div className="w-full mb-10">
        <div className="bg-white soft-shadow rounded-xl pb-1">
          <div className="flex flex-col pt-4">
            <div className="flex flex-col">
              {isLoading ? (
                <div className="leading-7 max-w-lg w-full pl-3 py-1.5 text-sm mb-4 text-nearblue-600">
                  <Skeleton className=" h-4 break-words" />
                </div>
              ) : (
                <div className="leading-7 pl-3 px-3 text-sm mb-4 text-nearblue-600">
                  {validatorFullData[currentPage]?.total || 0}
                  Validators found
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <Widget
                src={`${config?.ownerId}/widget/bos-components.components.Shared.Table`}
                props={{
                  columns: columns,
                  data: validatorFullData[currentPage]?.validatorEpochData,
                  count: totalCount,
                  isLoading: isLoading,
                  renderRowSubComponent: ExpandedRow,
                  expanded,
                  isPagination: true,
                  page: currentPage,
                  limit: 25,
                  pageLimit: 999,
                  setPage: setPage,
                  Error: errorMessage,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
