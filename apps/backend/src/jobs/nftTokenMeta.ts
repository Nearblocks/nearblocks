import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncNFTTokenMeta } from '#services/nfts/meta';

export const task = async () => {
  try {
    logger.info('nftTokenMeta: job started');
    await syncNFTTokenMeta();
    logger.info('nftTokenMeta: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('nftTokenMeta: job error');
    logger.error(error);
  }
};
