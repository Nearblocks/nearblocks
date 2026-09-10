import { logger } from 'nb-logger';

import { setRpcJob } from '#libs/rpcCounter';
import sentry from '#libs/sentry';
import { syncFTSupply } from '#services/fts/supply';

setRpcJob('tokenSupply');

export const task = async () => {
  try {
    logger.info('tokenSupply: job started');
    await syncFTSupply();
    logger.info('tokenSupply: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('tokenSupply: job error');
    logger.error(error);
  }
};
