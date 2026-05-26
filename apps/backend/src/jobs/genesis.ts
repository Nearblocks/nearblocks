import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { genesisProtocolInfoFetch } from '#services/contracts/tasks';

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
