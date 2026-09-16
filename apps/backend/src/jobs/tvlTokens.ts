import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncTvlTokens } from '#services/tvl';

export const task = async () => {
  try {
    logger.info('tvlTokens: job started');
    await syncTvlTokens();
    logger.info('tvlTokens: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('tvlTokens: job error');
    logger.error(error);
  }
};
