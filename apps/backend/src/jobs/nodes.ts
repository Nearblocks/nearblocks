import { logger } from 'nb-logger';

import { setRpcJob } from '#libs/rpcCounter';
import sentry from '#libs/sentry';
import {
  updatePoolInfoMap,
  updateStakingPoolStake,
  validatorsCheck,
} from '#services/contracts/tasks';

setRpcJob('nodes');

export const task = async () => {
  try {
    logger.info('nodes: job started');
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
