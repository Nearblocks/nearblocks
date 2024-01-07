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
  const [validatorFullData, setValidatorFullData] = useState<ValidatorFullData>(
    initialValidatorFullData,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [totalSuppy, setTotalSupplay] = useState('');
  const [expanded, setExpanded] = useState<number[]>([]);
  const errorMessage = 'No validator data!';
  const config = getConfig(network);

  const TotalSupply = yoctoToNear(Number(totalSuppy), false);

  useEffect(() => {
    function fetchValidatorData() {
      asyncFetch(`${config?.backendUrl}validators?page=${currentPage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res: any) => {
          const data = res.body;
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
          setValidatorFullData(validators);
        })
        .catch(() => {})
        .finally(() => {});
    }
    function fetchTotalSuppy() {
      setIsLoading(true);
      asyncFetch(`${config?.backendUrl}stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res: any) => {
          const data = res.body;

          setTotalSupplay(data.stats[0].total_supply);
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }
    fetchTotalSuppy();
    fetchValidatorData();
  }, [config?.backendUrl, currentPage]);

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
        return 'Active';
    }
  };
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-[#28a745]';
      case 'joining':
        return 'text-[#ffc107]';
      case 'leaving':
        return 'text-[#dc3545]';
      case 'proposal':
        return 'text-[#17a2b8]';
      case 'idle':
        return 'text-[#6c757d]';
      case 'newcomer':
        return 'text-[#fd7e14]';
      case 'onHold':
        return 'text-[#007bff]';
      default:
        return 'text-black';
    }
  };
  const columns = [
    {
      header: <span></span>,
      key: '',
      cell: (row: ValidatorEpochData) => (
        <div className="">
          <button onClick={() => handleRowClick(row.index || 0)}>
            <ArrowDown
              className={`${row.isExpanded ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
        </div>
      ),
      tdClassName: 'pl-6 py-4 whitespace-nowrap text-sm text-gray-500 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: <span>Status</span>,
      key: 'View',
      cell: (row: ValidatorEpochData) => (
        <div className="">
          <div>{stakingStatusLabel(row?.stakingStatus ?? '')}</div>
        </div>
      ),
      tdClassName: 'pl-6 py-4 whitespace-nowrap text-sm text-gray-500 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: <span>VALIDATOR</span>,
      key: 'accountId',
      tdClassName: 'pl-6 py-4 whitespace-nowrap text-sm text-gray-500 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
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
      tdClassName: 'pl-6 py-4 whitespace-nowrap text-sm text-gray-500 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },

    {
      header: 'DELEGATORS',
      key: 'deligators',
      cell: (row: ValidatorEpochData) => {
        return (
          <div>
            {row?.poolInfo?.delegatorsCount !== undefined
              ? row?.poolInfo?.delegatorsCount
              : 'N/A'}
          </div>
        );
      },
      tdClassName: 'pl-6 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: 'TOTAL STAKE',
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
      tdClassName: 'pl-6 py-4 whitespace-nowrap text-sm text-gray-500 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: 'STAKE %',
      key: 'percentage',
      cell: (row: ValidatorEpochData) => {
        return <div>{row?.percent}%</div>;
      },
      tdClassName: 'pl-6 py-4 whitespace-nowrap text-sm text-gray-500 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: 'CUMULATIVE STAKE',
      key: 'cumulative_stake',
      cell: (row: ValidatorEpochData) => {
        return (
          <div>
            <div className="relative w-50 h-7 soft-shadow rounded-lg overflow-hidden bg-gray-300">
              <div
                className="absolute top-0 left-0 right-0 bottom-0 h-full bg-green-500 text-center flex items-center justify-center"
                style={{
                  width: `${row?.cumilativeStake?.cumulativePercent || 0}%`,
                }}
              ></div>
              <span className="absolute  text-white inset-0 flex items-center justify-center">
                {row?.cumilativeStake?.cumulativePercent
                  ? `${row?.cumilativeStake?.cumulativePercent}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        );
      },
      tdClassName: 'pl-6 py-4 whitespace-nowrap text-sm text-gray-500 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: 'STAKE CHANGE (24H)',
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
              Math.abs(Number(visibleStake)),
              'seatPriceAmount',
            )} Ⓝ`;
          }
          return null;
        }
        return (
          <div className="flex">
            {row?.stakeChange?.symbol}
            <p>{row?.stakeChange?.value}Ⓝ</p>
          </div>
        );
      },
      tdClassName: 'pl-6 py-4 whitespace-nowrap text-sm text-gray-500 ',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
  ];

  const ExpandedRow = (row: ValidatorEpochData) => {
    const telemetry = validatorFullData?.validatorTelemetry[row.accountId];
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
                              <div
                                className="d-flex "
                                style={{ display: 'flex' }}
                              >
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
                        'px-5 whitespace-nowrap text-sm text-gray-500 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    },
                    {
                      header: (
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <div
                                className="d-flex "
                                style={{ display: 'flex' }}
                              >
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
                            className={getStatusColorClass(
                              row?.stakingStatus ?? '',
                            )}
                          >
                            {telemetry?.lastHeight}
                          </div>
                        );
                      },
                      tdClassName:
                        'px-5 whitespace-nowrap text-sm text-gray-500 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    },
                    {
                      header: (
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <div
                                className="d-flex "
                                style={{ display: 'flex' }}
                              >
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
                        'px-5 whitespace-nowrap text-sm text-gray-500 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    },
                    {
                      header: (
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <div
                                className="d-flex "
                                style={{ display: 'flex' }}
                              >
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
                                className="text-blue-100"
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
                        'px-5 whitespace-nowrap text-sm text-gray-500 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
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
                        'px-5 whitespace-nowrap text-sm text-gray-500 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
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
                          <div className="text-sky-500">
                            <a
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
                        'px-5 whitespace-nowrap text-sm text-gray-500 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    },
                    {
                      header: 'Email',
                      key: 'email',
                      cell: (row: ValidatorEpochData) => {
                        return (
                          <div className="text-sky-500">
                            <a href={`mailto:${row?.description?.email}`}>
                              {row?.description?.email}{' '}
                            </a>
                          </div>
                        );
                      },
                      tdClassName:
                        'px-5 whitespace-nowrap text-sm text-gray-500 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    },
                    row?.description?.twitter && {
                      header: 'Twitter',
                      key: 'twitter',
                      cell: (row: ValidatorEpochData) => {
                        return (
                          <div className="text-sky-500">
                            <a
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
                        'px-5 whitespace-nowrap text-sm text-gray-500 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    },
                    row?.description?.discord && {
                      header: 'Discord',
                      key: 'discord',
                      cell: (row: ValidatorEpochData) => {
                        return (
                          <div className="text-sky-500">
                            <a
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
                        'px-5 whitespace-nowrap text-sm text-gray-500 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    },
                    {
                      header: 'Description',
                      key: 'description',
                      cell: (row: ValidatorEpochData) => {
                        return (
                          <div className="text-gray-400">
                            <small>{row?.description?.description}</small>
                          </div>
                        );
                      },
                      tdClassName:
                        'px-5 whitespace-nowrap text-sm text-gray-500 font-medium',
                      thClassName:
                        'px-5 pt-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                    },
                  ],
                  data: [row] || [],
                  isLoading: false,
                  isPagination: false,
                  isExpanded: true,
                }}
              />
            ) : (
              <div className="flex justify-center text-sm text-gray-500 font-medium py-4 ">
                If you are node owner feel free to fill all &nbsp;
                <a
                  href="https://github.com/zavodil/near-pool-details#description"
                  className="text-sky-500"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {' '}
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
    <div className="container mx-auto px-3 -mt-48">
      <div>
        <div className="flex gap-4  mt-10">
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-lg overflow-hidden">
              <div>
                <h2 className=" flex justify-between border-b p-3 text-gray-600 text-sm font-semibold">
                  <span>Staking overview</span>
                  <div className="flex">
                    <span>Total Supply: </span>{' '}
                    {isLoading ? (
                      <Skeleton className="h-4 w-12 break-words" />
                    ) : (
                      <span>
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <span>{formatNumber(Number(TotalSupply))}</span>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                              align="center"
                              side="top"
                            >
                              {totalSuppy + ' yoctoⓃ'}
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>{' '}
                      </span>
                    )}
                  </div>
                </h2>
              </div>
              <div className="px-3 divide-y text-sm text-gray-600">
                <div className="flex  py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Current Validators
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    {isLoading ? (
                      <Skeleton className="h-4 w-16 break-words" />
                    ) : (
                      validatorFullData?.currentValidators
                    )}
                  </div>
                </div>
                <div className="flex  py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Total Staked
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    {isLoading ? (
                      <Skeleton className="h-4 w-16 break-words" />
                    ) : (
                      convertAmountToReadableString(
                        validatorFullData?.totalStake,
                        'totalStakeAmount',
                      )
                    )}
                  </div>
                </div>
                <div className="flex  py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Current seat price
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    {isLoading ? (
                      <Skeleton className="h-4 w-16 break-words" />
                    ) : (
                      <>
                        {convertAmountToReadableString(
                          Number(validatorFullData?.seatPrice),
                          'seatPriceAmount',
                        )}
                        Ⓝ
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-lg overflow-hidden">
              <h2 className="border-b p-3 text-gray-600 text-sm font-semibold">
                Epoch information
              </h2>
              <div className="px-3 divide-y text-sm text-gray-600">
                <div className="flex items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Epoch elapsed time:
                  </div>
                  <div className="w-full text-green-500 md:w-3/4 break-words">
                    {!validatorFullData?.elapsedTime ? (
                      <Skeleton className="h-3 w-32" />
                    ) : (
                      convertTimestampToTime(validatorFullData?.elapsedTime)
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">ETA:</div>
                  <div className="w-full md:w-3/4 text-green-500 break-words">
                    {!validatorFullData?.totalSeconds ? (
                      <Skeleton className="h-3 w-32" />
                    ) : (
                      convertTimestampToTime(validatorFullData?.totalSeconds)
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Progress</div>
                  <div className="w-full md:w-3/4 break-words">
                    {!validatorFullData?.epochProgress ? (
                      <Skeleton className="h-3 w-full" />
                    ) : (
                      <div className="flex space-x-4 gap-2 items-center ">
                        <div className="bg-blue-50 h-2 w-full rounded-full">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${validatorFullData?.epochProgress.toFixed(
                                1,
                              )}%`,
                            }}
                          ></div>
                        </div>
                        {validatorFullData?.epochProgress.toFixed(0)}%
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
          <div className="bg-white soft-shadow rounded-lg pb-1">
            <div className="flex flex-col pt-4">
              <div className="flex flex-col">
                {isLoading ? (
                  <p className="leading-7 pl-3 px-3 text-sm mb-4 text-gray-500">
                    <Skeleton className=" h-4 w-25 break-words" />
                  </p>
                ) : (
                  <div className="leading-7 pl-3 px-3 text-sm mb-4 text-gray-500">
                    {validatorFullData?.total}
                    Validators found
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <Widget
                  src={`${config?.ownerId}/widget/bos-components.components.Shared.Table`}
                  props={{
                    columns: columns,
                    data: validatorFullData?.validatorEpochData || [],
                    count: validatorFullData?.total,
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
    </div>
  );
}
