import { logger } from 'nb-logger';

import { setRpcJob } from '#libs/rpcCounter';
import sentry from '#libs/sentry';
import {
  poolIdsCheck,
  stakingPoolMetadataCheck,
} from '#services/contracts/tasks';

setRpcJob('pools');

export const task = async () => {
  try {
    logger.info('pools: job started');
    await poolIdsCheck();
    await stakingPoolMetadataCheck();

    logger.info('pools: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('pools: job error');
    logger.error(error);
  }
};
