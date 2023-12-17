import Skelton from '@/includes/Common/Skelton';
import { formatWithCommas } from '@/includes/formats';
import {
  convertAmountToReadableString,
  convertTimestampToTime,
  getConfig,
  nanoToMilli,
} from '@/includes/libs';
import { EpochStartBlock } from '@/includes/types';

import {
  CurrentEpochValidatorInfo,
  LatestBlock,
  ProtocolConfig,
  ValidatorEpochData,
  ValidatorFullData,
} from 'nb-types';

export default function () {
  const FRACTION_DIGITS = 2;
  const EXTRA_PRECISION_MULTIPLIER = 10000;
  const [validatorData, setValidatorData] = useState<ValidatorEpochData[]>([]);
  const [validatorFullData, setValidatorFullData] = useState<
    ValidatorEpochData[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [currentValidators, setCurrentValidators] = useState<
    CurrentEpochValidatorInfo[]
  >([]);

  const [protocolConfig, setProtocolConfig] = useState<ProtocolConfig>(
    {} as ProtocolConfig,
  );

  const [seatPrice, setSeatPrice] = useState<string>('');
  const [epochStartBlock, setEpochStartBlock] = useState<EpochStartBlock>(
    {} as EpochStartBlock,
  );
  const [latestBlockSub, setLatestBlockSub] = useState<LatestBlock>(
    {} as LatestBlock,
  );
  const config = getConfig(context.networkId);

  const validatorInfo = useCache(
    () =>
      asyncFetch(`${config?.backendUrl}validators`).then((res: any) => {
        const data = res.body;
        setCurrentValidators(data?.currentValidators);

        const mappedValidators = data?.combinedData;
        setValidatorFullData(mappedValidators);
        setProtocolConfig(data?.protocolConfig);
        setSeatPrice(data?.epochStatsCheck);
        setEpochStartBlock(data?.epochStartBlock);
        setLatestBlockSub(data?.latestBlock);
        setValidatorData(mappedValidators);
        return data;
      }),
    `${context.networkId}:validatorInfo`,
    { subscribe: true },
  );
  if (validatorInfo) {
    setIsLoading(false);
  }

  const sortByBNComparison = (aValue?: string, bValue?: string) => {
    const a = aValue ? new Big(aValue) : null;
    const b = bValue ? new Big(bValue) : null;

    if (a && b) {
      return a.cmp(b);
    }
    if (a) {
      return -1;
    }
    if (b) {
      return 1;
    }
    return 0;
  };

  const getTotalStake = (validators: ValidatorFullData[]) =>
    validators.length > 0 &&
    validators
      .map((validator) => validator?.currentEpoch?.stake || 0)
      .filter((stake) => typeof stake === 'string' && stake !== '')
      .reduce((acc, stake) => new Big(acc).plus(stake).toString(), '0');

  const totalStake = useMemo(
    () => getTotalStake(validatorFullData),
    [validatorFullData],
  );

  const sortedValidators = useMemo(() => {
    type ValidatorSortFn = (
      a: ValidatorFullData,
      b: ValidatorFullData,
    ) => number;

    const validatorsSortFns: ValidatorSortFn[] = [
      (a, b) =>
        sortByBNComparison(a.currentEpoch?.stake, b.currentEpoch?.stake),
      (a, b) => sortByBNComparison(a.nextEpoch?.stake, b.nextEpoch?.stake),
      (a, b) =>
        sortByBNComparison(a.afterNextEpoch?.stake, b.afterNextEpoch?.stake),
      (a, b) => sortByBNComparison(a.contractStake, b.contractStake),
    ];

    return validatorsSortFns.reduceRight(
      (acc, sortFn) => {
        return acc.sort(sortFn);
      },
      [...validatorFullData],
    );
  }, [validatorFullData]);

  const cumulativeAmounts = useMemo(() => {
    return sortedValidators.reduce(
      (acc: any, validator: any) => {
        const lastAmount = new Big(acc[acc.length - 1]);
        return [
          ...acc,
          validator.currentEpoch
            ? lastAmount.add(validator?.currentEpoch?.stake).toString()
            : lastAmount.toString(),
        ];
      },
      ['0'],
    );
  }, [sortedValidators]);

  const epochProgress = useMemo(() => {
    if (
      !latestBlockSub?.height ||
      !epochStartBlock?.height ||
      !protocolConfig?.epochLength
    ) {
      return 0;
    }

    return (
      ((latestBlockSub.height - epochStartBlock.height) /
        protocolConfig.epochLength) *
      100
    );
  }, [latestBlockSub, epochStartBlock, protocolConfig]);

  const timeRemaining = useMemo(() => {
    if (
      !latestBlockSub?.timestamp ||
      !epochStartBlock?.timestamp ||
      !epochProgress
    ) {
      return 0;
    }
    const epochTimestamp = nanoToMilli(epochStartBlock?.timestamp || 0);
    const latestBlockTimestamp = nanoToMilli(latestBlockSub?.timestamp || 0);

    return (
      ((latestBlockTimestamp - epochTimestamp) / epochProgress) *
      (100 - epochProgress)
    );
  }, [epochProgress, epochStartBlock, latestBlockSub]);

  const totalSeconds = useMemo(
    () => (timeRemaining ? Math.floor(timeRemaining / 1000) : 0),
    [timeRemaining],
  );

  const elapsedTime = useMemo(() => {
    if (!epochStartBlock?.timestamp) {
      return 0;
    }
    const epochTimestamp = nanoToMilli(epochStartBlock?.timestamp || 0);
    return (Date.now() - epochTimestamp) / 1000;
  }, [epochStartBlock]);

  const columns = [
    { header: 'VALIDATOR', key: 'accountId' },
    {
      header: 'FEE',
      key: 'poolInfo',
      cell: (row: ValidatorFullData) => {
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
      cell: (row: ValidatorFullData) => {
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
      cell: (row: ValidatorFullData) => (
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
        const currentStake = row.currentEpoch?.stake;
        const stake = currentStake ? new Big(currentStake) : new Big(0);
        const extra = new Big(EXTRA_PRECISION_MULTIPLIER);
        const ownPercent = stake.times(extra).div(totalStake).toNumber();
        const percent = ((ownPercent / extra) * 100).toFixed(FRACTION_DIGITS);
        return <div>{percent && percent}% </div>;
      },
    },
    {
      header: 'CUMULATIVE STAKE',
      key: 'cumulative_stake',
      cell: (row: ValidatorEpochData) => {
        if (!row.currentEpoch) {
          return 'N/A';
        }
        const index = Number(row.index) + 1 ?? 1;
        const extra = new Big(EXTRA_PRECISION_MULTIPLIER);

        const cumulativeStakePercent = Big(totalStake).lte(0)
          ? 0
          : new Big(cumulativeAmounts[index])
              .times(extra)
              .div(totalStake)
              .toNumber();

        const cumulativePercent =
          cumulativeStakePercent / EXTRA_PRECISION_MULTIPLIER;
        const percentage = (cumulativePercent * 100).toFixed(FRACTION_DIGITS);

        return <div>{percentage && percentage}%</div>;
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
                        currentValidators?.length
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
                          totalStake,
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
                            Number(seatPrice),
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
                      {!elapsedTime ? (
                        <Skelton className="h-3 w-32" />
                      ) : (
                        convertTimestampToTime(elapsedTime)
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">ETA:</div>
                    <div className="w-full md:w-3/4 text-green-500 break-words">
                      {!totalSeconds ? (
                        <Skelton className="h-3 w-32" />
                      ) : (
                        convertTimestampToTime(totalSeconds)
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                      Progress
                    </div>
                    <div className="w-full md:w-3/4 break-words">
                      {!epochProgress ? (
                        <Skelton className="h-3 w-full" />
                      ) : (
                        <div className="flex space-x-4 gap-2 items-center ">
                          <div className="bg-blue-50 h-2 w-full rounded-full">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${epochProgress.toFixed(1)}%` }}
                            ></div>
                          </div>
                          {epochProgress.toFixed(0)}%
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
                      {validatorFullData?.length}
                      Validators found
                    </p>
                  )}
                </div>
                <div className="flex flex-col">
                  <Widget
                    src={`${config?.ownerId}/widget/bos-components.components.Shared.Table`}
                    props={{
                      columns: columns,
                      data: validatorData || [],
                      isPagination: false,
                      count: validatorFullData.length,
                      isLoading: isLoading,
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
