import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { refreshFTMeta, syncFTMeta } from '#services/fts/meta';
import { refreshMTMeta, syncMTMeta, syncMTTokenMeta } from '#services/mts/meta';
import {
  refreshNFTMeta,
  syncNFTMeta,
  syncNFTTokenMeta,
} from '#services/nfts/meta';

export const task = async () => {
  try {
    logger.info('tokenMeta: job started');
    await Promise.all([
      syncFTMeta(),
      syncMTMeta(),
      syncMTTokenMeta(),
      syncNFTMeta(),
      syncNFTTokenMeta(),
      refreshFTMeta(),
      refreshMTMeta(),
      refreshNFTMeta(),
    ]);
    logger.info('tokenMeta: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('tokenMeta: job error');
    logger.error(error);
  }
};
