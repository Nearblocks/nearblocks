import Big from 'big.js';
import { Response } from 'express';

import catchAsync from '#libs/async';
import { readCache } from '#libs/redis';
import { List } from '#libs/schema/validator';
import { sortByBNComparison, nsToMsTime } from '#libs/utils';
import { RequestValidator } from '#types/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

type ValidatorSortFn = (
  a: any,
  b: any,
) => number;

const sortedValidators = (combinedData: any) => {


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
    [...combinedData],
  );
}


const epochProgress = (latestBlockSub: any, epochStartBlock: any, protocolConfig: any) => {
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
}

const timeRemaining = (latestBlockSub: any, epochStartBlock: any, epochProgress: any) => {
  if (
    !latestBlockSub?.timestamp ||
    !epochStartBlock?.timestamp ||
    !epochProgress
  ) {
    return 0;
  }
  const epochTimestamp = Number(nsToMsTime(epochStartBlock?.timestamp || 0));
  const latestBlockTimestamp = Number(nsToMsTime(latestBlockSub?.timestamp || 0));

  return (
    ((latestBlockTimestamp - epochTimestamp) / epochProgress) *
    (100 - epochProgress)
  );
}

const elapsedTime = (epochStartBlock: any) => {
  if (!epochStartBlock?.timestamp) {
    return 0;
  }
  const epochTimestamp = Number(nsToMsTime(epochStartBlock?.timestamp || 0));
  return (Date.now() - epochTimestamp) / 1000;
}

const FRACTION_DIGITS = 2;
const EXTRA_PRECISION_MULTIPLIER = 10000;

const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const page = req.validator.data.page;
  const perPage = req.validator.data.per_page;


  const [
    combinedData,
    currentValidators,
    nextValidators,
    protocolConfig,
    genesisConfig,
    epochStatsCheck,
    epochStartBlock,
    latestBlock,
    validatorTelemetry,
  ] = await Promise.all([
    readCache('validatorLists'),
    readCache('currentValidators'),
    readCache('nextValidators'),
    readCache('protocolConfig'),
    readCache('genesisConfig'),
    readCache('epochStatsCheck'),
    readCache('epochStartBlock'),
    readCache('latestBlock'),
    readCache('validatorTelemetry'),
  ]);

  const validatorPaginatedData = combinedData?.slice(page * perPage - perPage, page * perPage)

  const totalStake = combinedData.length > 0 &&
    combinedData
      .map((validator: any) => validator?.currentEpoch?.stake || 0)
      .filter((stake: any) => typeof stake === 'string' && stake !== '')
      .reduce((acc: any, stake: any) => new Big(acc).plus(stake).toString(), '0');
      
  const sortedValidatorsData = sortedValidators(combinedData)

  const cumulativeAmounts = sortedValidatorsData.reduce(
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


  const epochProgressData = epochProgress(latestBlock, epochStartBlock, protocolConfig)
  const timeRemainingData: any = timeRemaining(latestBlock, epochStartBlock, epochProgress)


  const totalSeconds = (timeRemainingData ? Math.floor(+timeRemainingData / 1000) : 0)

  const elapsedTimeData = elapsedTime(epochStartBlock)

  const validatorFullData = validatorPaginatedData.map((validator:any) => {
    const currentStake = validator.currentEpoch?.stake;
    const stake = currentStake ? Big(currentStake) : Big(0);
    const extra =  Big(EXTRA_PRECISION_MULTIPLIER);
    const ownPercent = stake.times(extra).div(totalStake)
    const percent = (ownPercent.div(extra) * Big(100));
    
    return {
      ...validator,
      percent,
    }
  })



  return res.status(200).json({
    combinedData,
    currentValidators,
    epochStartBlock,
    epochStatsCheck,
    genesisConfig,
    latestBlock,
    nextValidators,
    protocolConfig,
    validatorTelemetry,
  });
});

export default { list };
