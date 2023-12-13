import { Response } from 'express';

import catchAsync from '#libs/async';
import { readCache } from '#libs/redis';
import { List } from '#libs/schema/blocks.js';
import { RequestValidator } from '#types/types';

const list = catchAsync(async (_req: RequestValidator<List>, res: Response) => {
  const combinedData = await readCache('validatorLists');
  const currentValidators = await readCache('currentValidators');
  const nextValidators = await readCache('nextValidators');
  const protocolConfig = await readCache('protocolConfig');
  const genesisConfig = await readCache('genesisConfig');
  const epochStatsCheck = await readCache('epochStatsCheck');
  const epochStartBlock = await readCache('epochStartBlock');
  const latestBlock = await readCache('latestBlock');
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
