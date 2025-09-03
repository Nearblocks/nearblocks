import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { syncExistingFT } from '#services/fts/meta';
import {
  syncExistingIntents,
  syncExistingMT,
  syncExistingMTToken,
} from '#services/mts/meta';
import { syncExistingNFT, syncExistingNFTToken } from '#services/nfts/meta';

export const task = async () => {
  try {
    logger.info('meta old job started');
    await Promise.all([
      syncExistingFT(),
      syncExistingMT(),
      syncExistingMTToken(),
      syncExistingNFT(),
      syncExistingNFTToken(),
      syncExistingIntents(),
    ]);
    logger.info('meta old job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error(error);
  }
};
