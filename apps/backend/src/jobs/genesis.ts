import { logger } from 'nb-logger';

import { setRpcJob } from '#libs/rpcCounter';
import sentry from '#libs/sentry';
import { genesisProtocolInfoFetch } from '#services/contracts/tasks';

setRpcJob('genesis');

export const task = async () => {
  try {
    logger.info('genesis: job started');
    await genesisProtocolInfoFetch();
    logger.info('genesis: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('genesis: job error');
    logger.error(error);
  }
};
