import Big from 'big.js';
import { Response } from 'express';

import catchAsync from '#libs/async';
import redis from '#libs/redis';
import { List } from '#libs/schema/validators';
import {
  calculateTotalStake,
  elapsedTime,
  epochProgress,
  EXTRA_PRECISION_MULTIPLIER,
  findStakeChange,
  FRACTION_DIGITS,
  getStakingStatus,
  networkHolderIndex,
  stakePercents,
  timeRemaining,
  validatorsSortFns,
} from '#libs/validators';
import { RequestValidator } from '#types/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
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
    redis.parse('validatorLists'),
    redis.parse('currentValidators'),
    redis.parse('protocolConfig'),
    redis.parse('epochStatsCheck'),
    redis.parse('epochStartBlock'),
    redis.parse('latestBlock'),
    redis.parse('validatorTelemetry'),
  ]);

  if (combinedData && combinedData.length > 0) {
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

        const cumulativeStake = stakePercents(
          validator,
          currentStake,
          +totalStake,
          cumulativeAmounts[pagedIndex],
        );

        const isNetworkHolder = networkHolderIndex(
          totalStake,
          cumulativeAmounts,
        );
        const stakingStatus = getStakingStatus(validator, epochStatsCheck);

        const nextVisibleStake =
          validator.nextEpoch?.stake ?? validator.afterNextEpoch?.stake;

        const stakeDelta =
          validator.currentEpoch?.stake && nextVisibleStake
            ? Big(nextVisibleStake).minus(validator.currentEpoch.stake)
            : undefined;

        const stakeChange = findStakeChange(Number(stakeDelta));

        return {
          ...validator,
          cumulativeStake,
          percent,
          showWarning: isNetworkHolder === pagedIndex,
          stakeChange,
          stakingStatus,
          warning:
            isNetworkHolder === pagedIndex
              ? `Validators 1 - ${
                  index + 1
                } hold a cumulative stake above 33%. Delegating to the validators below improves the decentralization of the network.`
              : '',
        };
      },
    );

    return res.status(200).json({
      currentValidators: currentValidators.length,
      elapsedTimeData,
      epochProgressData,
      epochStatsCheck,
      latestBlock,
      total: combinedData.length,
      totalSeconds,
      totalStake,
      validatorFullData,
      validatorTelemetry,
    });
  }

  return res.status(200).json({
    currentValidators: 0,
    elapsedTimeData: 0,
    epochProgressData: 0,
    epochStatsCheck: 0,
    latestBlock: {},
    total: 0,
    totalSeconds: 0,
    totalStake: 0,
    validatorFullData: [],
    validatorTelemetry: [],
  });
});

export default { list };
