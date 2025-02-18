import { logger } from 'nb-logger';

import config from '#config';
import { syncData } from '#services/stream';

(async () => {
  try {
    logger.info(
      { data_source: config.dataSource, network: config.network },
      'initializing base indexer...',
    );
    await syncData();
  } catch (error) {
    logger.error('aborting...');
    logger.error(error);
    process.exit();
  }
})();
