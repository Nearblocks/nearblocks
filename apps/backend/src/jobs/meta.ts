import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncFTMeta } from '#services/fts/meta';
import { syncMTMeta, syncMTTokenMeta } from '#services/mts/meta';
import { syncNFTMeta, syncNFTTokenMeta } from '#services/nfts/meta';

export const task = async () => {
  try {
    logger.info('meta job started');
    await Promise.all([
      syncFTMeta(),
      syncMTMeta(),
      syncMTTokenMeta(),
      syncNFTMeta(),
      syncNFTTokenMeta(),
    ]);
    logger.info('meta job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error(error);
  }
};
