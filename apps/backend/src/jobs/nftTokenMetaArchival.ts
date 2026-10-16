import { logger } from 'nb-logger';

import { setRpcJob } from '#libs/rpcCounter';
import sentry from '#libs/sentry';
import { syncNFTTokenMetaArchival } from '#services/nfts/meta';

setRpcJob('nftTokenMetaArchival');

export const task = async () => {
  try {
    logger.info('nftTokenMetaArchival: job started');
    await syncNFTTokenMetaArchival();
    logger.info('nftTokenMetaArchival: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('nftTokenMetaArchival: job error');
    logger.error(error);
  }
};
