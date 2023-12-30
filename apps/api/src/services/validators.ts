import Big from 'big.js';
import { Response } from 'express';

import { BlockHeader } from 'nb-near';
import { LatestBlock, ProtocolConfig, ValidatorFullData } from 'nb-types';

import catchAsync from '#libs/async';
import { readCache } from '#libs/redis';
import { List } from '#libs/schema/validator';
import { nsToMsTime, sortByBNComparison } from '#libs/utils';
import { RequestValidator } from '#types/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

type ValidatorSortFn = (a: ValidatorFullData, b: ValidatorFullData) => number;

const validatorsSortFns: ValidatorSortFn[] = [
  (a, b) => sortByBNComparison(a.currentEpoch?.stake, b.currentEpoch?.stake),
  (a, b) => sortByBNComparison(a.nextEpoch?.stake, b.nextEpoch?.stake),
  (a, b) =>
    sortByBNComparison(a.afterNextEpoch?.stake, b.afterNextEpoch?.stake),
  (a, b) => sortByBNComparison(a.contractStake, b.contractStake),
];

const epochProgress = (
  latestBlockSub: LatestBlock,
  epochStartBlock: BlockHeader,
  protocolConfig: ProtocolConfig,
) => {
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
};

const timeRemaining = (
  latestBlockSub: LatestBlock,
  epochStartBlock: BlockHeader,
  epochProgress: number,
) => {
  if (
    !latestBlockSub?.timestamp ||
    !epochStartBlock?.timestamp ||
    !epochProgress
  ) {
    return 0;
  }
  const epochTimestamp = Number(nsToMsTime(epochStartBlock?.timestamp || 0));
  const latestBlockTimestamp = Number(
    nsToMsTime(latestBlockSub?.timestamp || 0),
  );

  return (
    ((latestBlockTimestamp - epochTimestamp) / epochProgress) *
    (100 - epochProgress)
  );
};

const elapsedTime = (epochStartBlock: BlockHeader) => {
  if (!epochStartBlock?.timestamp) {
    return 0;
  }
  const epochTimestamp = Number(nsToMsTime(epochStartBlock?.timestamp || 0));
  return (Date.now() - epochTimestamp) / 1000;
};

const FRACTION_DIGITS = 2;
const EXTRA_PRECISION_MULTIPLIER = 10000;

const stakePercents = (
  validator: ValidatorFullData,
  currentStake: any,
  totalStake: number,
  cumulativeStake: any,
) => {
  if (!validator.currentEpoch) {
    return null;
  }

  const extra = Big(EXTRA_PRECISION_MULTIPLIER);
  const stake = currentStake ? Big(currentStake) : Big(0);
  const ownPercent = Big(totalStake).eq(Big(0))
    ? Big(0)
    : stake.times(extra).div(Big(totalStake));

  const cumulativeStakePercent = Big(totalStake).eq(Big(0))
    ? Big(0)
    : Big(cumulativeStake).times(extra).div(Big(totalStake));
  console.log({ cumulativeStakePercent });

  const percents = {
    cumulativePercent: cumulativeStakePercent.div(extra),
    ownPercent: ownPercent.div(extra),
  };

  const accumulatedPercent = percents.cumulativePercent
    .minus(percents.ownPercent)
    .times(Big(100))
    .toFixed(FRACTION_DIGITS);
  const ownPercentage = percents.ownPercent
    .times(Big(100))
    .toFixed(FRACTION_DIGITS);
  const cumulativePercent = percents.cumulativePercent
    .times(Big(100))
    .toFixed(FRACTION_DIGITS);

  return {
    accumulatedPercent,
    cumulativePercent,
    ownPercentage,
  };
};

const calculateTotalStake = (validators: ValidatorFullData[]) =>
  validators
    .map((validator) => validator.currentEpoch?.stake)
    .filter((stake: any) => typeof stake === 'string' && stake !== '')
    .reduce((acc, stake: any) => Big(acc).plus(Big(stake)), Big(0));

const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const page = req.validator.data.page;
  const perPage = req.validator.data.per_page;

  const [
    combinedData,
    currentValidators,
    protocolConfig,
    epochStatsCheck,
    epochStartBlock,
    latestBlock,
    validatorTelemetry,
  ] = await Promise.all([
    readCache('validatorLists'),
    readCache('currentValidators'),
    readCache('protocolConfig'),
    readCache('epochStatsCheck'),
    readCache('epochStartBlock'),
    readCache('latestBlock'),
    readCache('validatorTelemetry'),
  ]);

  const validatorPaginatedData = combinedData?.slice(
    page * perPage - perPage,
    page * perPage,
  );

  const totalStake = calculateTotalStake(combinedData);

  const sortedValidatorsData = validatorsSortFns.reduceRight(
    (acc, sortFn) => acc.sort(sortFn),
    [...combinedData],
  );
  const cumulativeAmounts = sortedValidatorsData.reduce<Big[]>(
    (acc: Big[], validator: any) => {
      const lastAmount = acc[acc.length - 1] ?? Big(0);
      return [
        ...acc,
        validator.currentEpoch
          ? lastAmount.plus(Big(validator.currentEpoch.stake))
          : lastAmount,
      ];
    },
    [],
  );

  const epochProgressData = epochProgress(
    latestBlock,
    epochStartBlock,
    protocolConfig,
  );
  const timeRemainingData = timeRemaining(
    latestBlock,
    epochStartBlock,
    epochProgressData,
  );
  const totalSeconds = timeRemainingData
    ? Math.floor(+timeRemainingData / 1000)
    : 0;
  const elapsedTimeData = elapsedTime(epochStartBlock);

  const validatorFullData = validatorPaginatedData.map(
    (validator: any, index: number) => {
      const currentStake = validator.currentEpoch?.stake;
      const stake = currentStake ? Big(currentStake) : Big(0);
      const extra = Big(EXTRA_PRECISION_MULTIPLIER);

      const ownPercent: Big.BigSource = stake
        .times(extra)
        .div(Big(+totalStake));
      const percent = ownPercent
        .div(extra)
        .times(Big(100))
        .toFixed(FRACTION_DIGITS);
      const pagedIndex = (page - 1) * perPage + index;

      const cumilativeStake = stakePercents(
        validator,
        currentStake,
        +totalStake,
        cumulativeAmounts[pagedIndex],
      );

      return {
        ...validator,
        cumilativeStake,
        percent,
      };
    },
  );

  return res.status(200).json({
    currentValidators: currentValidators.length,
    elapsedTimeData,
    epochProgressData,
    epochStatsCheck,
    total: combinedData.length,
    totalSeconds,
    totalStake,
    validatorFullData,
    validatorTelemetry,
  });
});

export default { list };
