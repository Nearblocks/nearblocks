import Skelton from '@/includes/Common/Skelton';
import { formatWithCommas } from '@/includes/formats';
import {
  convertAmountToReadableString,
  convertTimestampToTime,
  getConfig,
  timeAgo,
} from '@/includes/libs';
import { ValidatorFullData } from '@/includes/types';
import ArrowDown from '@/includes/icons/ArrowDown';
import { ValidatorEpochData } from 'nb-types';

const pageLimit = 25;

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

export default function () {
  const [validatorFullData, setValidatorFullData] = useState<ValidatorFullData>(
    initialValidatorFullData,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [page, setPage] = useState<number>(1);

  const config = getConfig(context.networkId);

  const validatorInfo = useCache(
    () =>
      asyncFetch(`${config?.backendUrl}validators?page=${page}`).then(
        (res: any) => {
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
          return data;
        },
      ),
    `${context.networkId}:validatorInfo`,
    { subscribe: true },
  );
  if (validatorInfo) {
    setIsLoading(false);
  }

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

  const columns = [
    {
      header: 'Status',
      key: 'View',
      cell: (row: ValidatorEpochData) => {
        return (
          <div className="flex">
            <button onClick={() => handleRowClick(row.index || 0)}>
              <ArrowDown />
            </button>
            <div>{stakingStatusLabel(row?.stakingStatus ?? '')}</div>
          </div>
        );
      },
    },
    { header: 'VALIDATOR', key: 'accountId' },
    {
      header: 'FEE',
      key: 'poolInfo',
      cell: (row: ValidatorEpochData) => {
        return (
          <div>
            {row?.poolInfo?.fee !== undefined
              ? `${(
                  (row?.poolInfo?.fee!.numerator /
                    row?.poolInfo?.fee!.denominator) *
                  100
                ).toFixed(0)}%`
              : 'N/A'}
          </div>
        );
      },
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
    },
    {
      header: 'STAKE %',
      key: 'percentage',
      cell: (row: ValidatorEpochData) => {
        return <div>{row?.percent}%</div>;
      },
    },
    {
      header: 'CUMULATIVE STAKE',
      key: 'cumulative_stake',
      cell: (row: ValidatorEpochData) => {
        return (
          <div>
            {row?.cumilativeStake?.cumulativePercent
              ? `${row?.cumilativeStake?.cumulativePercent}%`
              : 'N/A'}
          </div>
        );
      },
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
    },
  ];

  const ExpandedRow = (row: ValidatorEpochData) => {
    const telemetry = validatorFullData?.validatorTelemetry[row.accountId];

    if (!telemetry) return;

    const progress = row?.currentEpoch?.progress;

    const productivityRatio = progress
      ? (progress.blocks.produced + progress.chunks.produced) /
        (progress.blocks.total + progress.chunks.total)
      : 0;

    return (
      <>
        <tr>
          <td colSpan={8} className="bg-gray-50">
            <Widget
              src={`${config?.ownerId}/widget/bos-components.components.Shared.Table`}
              props={{
                columns: [
                  {
                    header: 'Uptime',
                    key: 'uptime',
                    cell: () => {
                      return (
                        <div className="text-black">
                          {(productivityRatio * 100).toFixed(3)}%
                        </div>
                      );
                    },
                  },
                  {
                    header: 'Latest block',
                    key: 'latest_block',
                    cell: () => {
                      return (
                        <div className="text-black">
                          {telemetry?.lastHeight}
                        </div>
                      );
                    },
                  },
                  {
                    header: 'Latest Telemetry Update',
                    key: 'telemetry',
                    cell: () => {
                      return (
                        <div className="text-black">
                          {telemetry?.lastSeen && timeAgo(telemetry?.lastSeen)}
                        </div>
                      );
                    },
                  },
                  {
                    header: 'Node Agent Name',
                    key: 'agent_name',
                    cell: () => {
                      return (
                        <span className="text-black rounded bg-gray-300 px-1">
                          {telemetry?.agentName}{' '}
                        </span>
                      );
                    },
                  },
                  {
                    header: 'Node Agent Version / Build',
                    key: 'agent_version',
                    cell: () => {
                      return (
                        <span className="text-black rounded bg-gray-300 px-1">{`${telemetry?.agentVersion}/${telemetry?.agentBuild}`}</span>
                      );
                    },
                  },
                ],
                data: [telemetry] || [],
                isLoading: false,
                isPagination: false,
                tiny: true,
              }}
            />
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
                    },
                  ],
                  data: [row] || [],
                  isLoading: false,
                  isPagination: false,
                  tiny: true,
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
    <div>
      <div className="bg-hero-pattern h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:sm:text-2xl text-xl text-white">
            NEAR Protocol Validator Explorer
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div>
          <div className="flex gap-4  mt-10">
            <div className="w-full">
              <div className="h-full bg-white soft-shadow rounded-lg overflow-hidden">
                <h2 className="border-b p-3 text-gray-600 text-sm font-semibold">
                  Staking overview
                </h2>
                <div className="px-3 divide-y text-sm text-gray-600">
                  <div className="flex  py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Current Validators
                    </div>
                    <div className="w-full md:w-3/4 break-words">
                      {isLoading ? (
                        <Skelton className="w-16 break-words" />
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
                        <Skelton className="w-16 break-words" />
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
                        <Skelton className="w-16 break-words" />
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
                        <Skelton className="h-3 w-32" />
                      ) : (
                        convertTimestampToTime(validatorFullData?.elapsedTime)
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">ETA:</div>
                    <div className="w-full md:w-3/4 text-green-500 break-words">
                      {!validatorFullData?.totalSeconds ? (
                        <Skelton className="h-3 w-32" />
                      ) : (
                        convertTimestampToTime(validatorFullData?.totalSeconds)
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Progress
                    </div>
                    <div className="w-full md:w-3/4 break-words">
                      {!validatorFullData?.epochProgress ? (
                        <Skelton className="h-3 w-full" />
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
                    <div className="leading-7 px-3 text-sm mb-4 text-gray-500">
                      <Skelton className="w-25 break-words" />
                    </div>
                  ) : (
                    <div className="leading-7 px-3 text-sm mb-4 text-gray-500">
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
                      page: page,
                      limit: pageLimit,
                      pageLimit: 999,
                      setPage: setPage,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
