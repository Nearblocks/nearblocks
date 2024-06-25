/* eslint-disable @typescript-eslint/no-explicit-any */
import Big from 'big.js';

import { BlockHeader } from 'nb-near';
import { LatestBlock, ProtocolConfig, ValidatorFullData } from 'nb-types';

import {
  localFormat,
  nsToMsTime,
  sortByBNComparison,
  yoctoToNear,
} from '#libs/utils';

type ValidatorSortFn = (a: ValidatorFullData, b: ValidatorFullData) => number;

export const validatorsSortFns: ValidatorSortFn[] = [
  (a, b) => sortByBNComparison(a.currentEpoch?.stake, b.currentEpoch?.stake),
  (a, b) => sortByBNComparison(a.nextEpoch?.stake, b.nextEpoch?.stake),
  (a, b) =>
    sortByBNComparison(a.afterNextEpoch?.stake, b.afterNextEpoch?.stake),
  (a, b) => sortByBNComparison(a.contractStake, b.contractStake),
];

export const epochProgress = (
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

export const timeRemaining = (
  latestBlockSub: LatestBlock,
  epochStartBlock: BlockHeader,
  epochProgress: number,
) => {
  if (
    !latestBlockSub?.timestamp ||
    !epochStartBlock?.timestamp ||
    !epochProgress
  )
    return 0;

  const epochTimestamp = Number(nsToMsTime(epochStartBlock?.timestamp || 0));
  const latestBlockTimestamp = Number(
    nsToMsTime(latestBlockSub?.timestamp || 0),
  );

  return (
    ((latestBlockTimestamp - epochTimestamp) / epochProgress) *
    (100 - epochProgress)
  );
};

export const elapsedTime = (epochStartBlock: BlockHeader) => {
  if (!epochStartBlock?.timestamp) return 0;

  const epochTimestamp = Number(nsToMsTime(epochStartBlock?.timestamp || 0));

  return (Date.now() - epochTimestamp) / 1000;
};

export const FRACTION_DIGITS = 2;
export const EXTRA_PRECISION_MULTIPLIER = 10000;

export const stakePercents = (
  validator: ValidatorFullData,
  currentStake: any,
  totalStake: number,
  cumulativeStake: any,
) => {
  if (!validator.currentEpoch) return null;

  const extra = Big(EXTRA_PRECISION_MULTIPLIER);
  const stake = currentStake ? Big(currentStake) : Big(0);
  const ownPercent = Big(totalStake).eq(Big(0))
    ? Big(0)
    : stake.times(extra).div(Big(totalStake));

  const cumulativeStakePercent = Big(totalStake).eq(Big(0))
    ? Big(0)
    : Big(cumulativeStake).times(extra).div(Big(totalStake));

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

export const calculateTotalStake = (validators: ValidatorFullData[]) =>
  validators
    .map((validator) => validator.currentEpoch?.stake)
    .filter((stake: any) => typeof stake === 'string' && stake !== '')
    .reduce((acc, stake: any) => Big(acc).plus(Big(stake)), Big(0));

const NETWORK_HOLDER_SHARE_PERCENT = 33;

export const networkHolderIndex = (totalStake: any, cumulativeAmounts: any) => {
  const holderLimit = Big(totalStake)
    .times(NETWORK_HOLDER_SHARE_PERCENT)
    .div(Big(100));

  return cumulativeAmounts.findIndex((cumulativeAmount: any) =>
    Big(cumulativeAmount).gt(holderLimit),
  );
};

export const getStakingStatus = (
  validator: ValidatorFullData,
  seatPrice?: string,
) => {
  if (validator.currentEpoch) return validator.nextEpoch ? 'active' : 'leaving';
  if (validator.nextEpoch) return 'joining';
  if (validator.afterNextEpoch) return 'proposal';
  if (!seatPrice) return null;

  const contractStake = validator.contractStake
    ? Big(validator.contractStake)
    : undefined;

  if (!contractStake) return null;

  const seatPriceBN = Big(seatPrice);

  if (contractStake.gte(seatPriceBN)) return 'onHold';
  if (contractStake.gte(seatPriceBN.times(Big(20)).div(Big(100))))
    return 'newcomer';

  return 'idle';
};

export const findStakeChange = (stakeDelta: number) => {
  if (!stakeDelta) return null;
  if (Big(stakeDelta).eq(Big(0))) return null;

  const amount = Number(yoctoToNear(stakeDelta.toString()));
  const symbol = Big(stakeDelta).gte(Big(0)) ? `+` : `-`;

  return {
    symbol,
    value: Big(amount).lt(1)
      ? localFormat(Number(Big(amount).abs()).toFixed(4))
      : localFormat(Number(Big(amount).abs()).toFixed()),
  };
};

export const calculateAPY = (
  totalStake: Big,
  epochTimestamp: string,
  prevEpochTimestamp: string,
  totalSupply: string,
) => {
  const maxInflationRate = 0.05;
  const epochLength =
    Big(epochTimestamp).minus(prevEpochTimestamp).toNumber() / 1e9;
  const secondsInYear = 31536000;
  const epochsPerYear = secondsInYear / epochLength;
  const nearTreasuryReward = 0.1;

  const apy = Big(totalSupply)
    .times(Math.pow(1 + maxInflationRate, 1 / epochsPerYear) - 1)
    .times(epochsPerYear)
    .div(totalStake)
    .times(1 - nearTreasuryReward)
    .times(100)
    .toNumber()
    .toFixed(2);

  return apy;
};
