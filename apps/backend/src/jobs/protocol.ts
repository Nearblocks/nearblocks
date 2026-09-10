import { logger } from 'nb-logger';

import { setRpcJob } from '#libs/rpcCounter';
import sentry from '#libs/sentry';
import { apyCheck, protocolConfigCheck } from '#services/contracts/tasks';

setRpcJob('protocol');

export const task = async () => {
  try {
    logger.info('protocol: job started');
    await protocolConfigCheck();
    await apyCheck();
    logger.info('protocol: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('protocol: job error');
    logger.error(error);
  }
};
