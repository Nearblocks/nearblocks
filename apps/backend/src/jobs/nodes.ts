import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import {
  latestBlockCheck,
  updatePoolInfoMap,
  updateStakingPoolStake,
  validatorsCheck,
} from '#services/contracts/tasks';

export const task = async () => {
  try {
    logger.info('poolId: job started');
    await Promise.all([
      latestBlockCheck(),
      updatePoolInfoMap(),
      updateStakingPoolStake(),
      validatorsCheck(),
    ]);
    logger.info('poolId: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('poolId: job error');
    logger.error(error);
  }
};
