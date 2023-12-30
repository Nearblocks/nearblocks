import Skelton from '@/includes/Common/Skelton';
import { formatWithCommas, getTimeAgoString } from '@/includes/formats';
import {
  convertAmountToReadableString,
  convertTimestampToTime,
  getConfig,
  nanoToMilli,
} from '@/includes/libs';
import { ValidatorFullData } from '@/includes/types';

import { ValidatorEpochData } from 'nb-types';

const pageLimit = 10;

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

  const columns = [
    {
      header: 'Action',
      key: 'View',
      cell: (row: ValidatorEpochData) => {
        return (
          <div className="flex">
            <a href="#" onClick={() => handleRowClick(row.index || 0)}>
              Click
            </a>
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
        return <div>{row?.cumilativeStake?.cumulativePercent}%</div>;
      },
    },
    {
      header: 'STAKE CHANGE (24H)',
      key: '24_change',
      cell: (row: ValidatorEpochData) => {
        const nextVisibleStake =
          parseFloat(row.nextEpoch?.stake || '0') ??
          parseFloat(row.afterNextEpoch?.stake || '0');

        const currentStake = parseFloat(row.currentEpoch?.stake || '0');

        if (!isNaN(currentStake) && !isNaN(nextVisibleStake)) {
          const stakeDelta = nextVisibleStake - currentStake;

          if (stakeDelta !== 0) {
            return (
              <div className="flex">
                {stakeDelta >= 0 ? '+' : '-'}{' '}
                <p>
                  {convertAmountToReadableString(
                    Math.abs(stakeDelta),
                    'seatPriceAmount',
                  )}{' '}
                  Ⓝ
                </p>
              </div>
            );
          }
        }

        return null;
      },
    },
  ];

  const ExpandedRow = (row: ValidatorEpochData) => {
    const telemetry = validatorFullData?.validatorTelemetry[row.accountId];
    if (!telemetry) return;
    return (
      <>
        <tr>
          <td colSpan={8}>
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-1 p-4">Uptime</div>
              <div className="col-span-1 p-4">Latest block</div>
              <div className="col-span-1 p-4">Latest Telemetry Update</div>
              <div className="col-span-1 p-4">Node Agent Name</div>
              <div className="col-span-1 p-4">Node Agent Version / Build</div>

              <div className="col-span-1 p-4">98%</div>
              <div className="col-span-1 p-4"> {telemetry?.lastHeight}</div>
              <div className="col-span-1 p-4">
                {getTimeAgoString(nanoToMilli(telemetry?.lastSeen))}
              </div>
              <div className="col-span-1 p-4">{telemetry?.agentName}</div>
              <div className="col-span-1 p-4">{`${telemetry?.agentVersion}/${telemetry?.agentBuild}`}</div>
            </div>
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
                          )}{' '}
                          Ⓝ{' '}
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
                    <p className="leading-7 px-3 text-sm mb-4 text-gray-500">
                      <Skelton className="w-25 break-words" />
                    </p>
                  ) : (
                    <p className="leading-7 px-3 text-sm mb-4 text-gray-500">
                      {validatorFullData?.total}
                      Validators found
                    </p>
                  )}
                </div>
                <div className="flex flex-col">
                  <Widget
                    src={`${config?.ownerId}/widget/bos-components.components.Shared.Table`}
                    props={{
                      columns: columns,
                      data: validatorFullData?.validatorEpochData || [],
                      count: validatorFullData?.validatorEpochData.length,
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
