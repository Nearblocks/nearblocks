import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import {
  poolIdsCheck,
  stakingPoolMetadataCheck,
} from '#services/contracts/tasks';

export const task = async () => {
  try {
    logger.info('pools: job started');
    await Promise.all([poolIdsCheck(), stakingPoolMetadataCheck()]);

    logger.info('pools: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('pools: job error');
    logger.error(error);
  }
};
