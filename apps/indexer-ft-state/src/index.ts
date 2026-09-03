import { logger } from 'nb-logger';

import config from '#config';
import { db } from '#libs/knex';
import { server } from '#libs/prom';
import { rpc } from '#libs/rpc';
import sentry from '#libs/sentry';
import { checkAuditorReady, syncAudit } from '#services/audit';
import { loadUntracked } from '#services/detect';
import { syncData } from '#services/stream';

(async () => {
  try {
    logger.info({ network: config.network }, 'initializing indexer...');
    await loadUntracked(db);

    if (rpc) {
      await checkAuditorReady(rpc);

      syncAudit(db, rpc).catch((error) => {
        logger.error(error, 'ft state audit: auditor crashed');
        sentry.captureException(error);
      });
    } else {
      logger.warn('RPC_URL not set, ft state audit disabled');
    }

    await syncData();
  } catch (error) {
    logger.error('aborting...');
    logger.error(error);
    sentry.captureException(error);
    await Promise.all([server.close(), db.destroy(), sentry.close(1_000)]);
    process.exit(1);
  }
})();

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([server.close(), db.destroy(), sentry.close(1_000)]);
  } catch (error) {
    logger.error(error);
  }

  process.kill(process.pid, signal);
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
