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
    logger.info('nodes: job started');
    await latestBlockCheck();
    await validatorsCheck();
    await updatePoolInfoMap();
    await updateStakingPoolStake();
    logger.info('nodes: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('nodes: job error');
    logger.error(error);
  }
};
