import { logger } from 'nb-logger';

import { setRpcJob } from '#libs/rpcCounter';
import sentry from '#libs/sentry';
import { syncNFTTokenMeta } from '#services/nfts/meta';

setRpcJob('nftTokenMeta');

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
