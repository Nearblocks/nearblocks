import { Response } from 'express';

import catchAsync from '#libs/async';
import redis from '#libs/redis';
import { List } from '#libs/schema/blocks.js';
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
  ] = await Promise.all([
    redis.parse('validatorLists'),
    redis.parse('currentValidators'),
    redis.parse('nextValidators'),
    redis.parse('protocolConfig'),
    redis.parse('genesisConfig'),
    redis.parse('epochStatsCheck'),
    redis.parse('epochStartBlock'),
    redis.parse('latestBlock'),
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
  });
});

export default { list };
