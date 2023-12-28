import { Response } from 'express';

import catchAsync from '#libs/async';
import { readCache } from '#libs/redis';
import { List } from '#libs/schema/validator';
import { RequestValidator } from '#types/types';

const list = catchAsync(async (_req: RequestValidator<List>, res: Response) => {
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
