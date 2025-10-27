import { logger as log } from 'nb-logger';

import { scheduleJobs } from '#cron';
import { dbBase, dbContracts, dbEvents } from '#libs/knex';
import sentry from '#libs/sentry';

// schedule cron jobs
scheduleJobs();

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([
      dbBase.destroy(),
      dbContracts.destroy(),
      dbEvents.destroy(),
      sentry.close(1000),
    ]);
  } catch (error) {
    log.error(error);
  }

  process.kill(process.pid, signal);
};

process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  sentry.captureException(error, { tags: { type: 'uncaughtException' } });
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled rejection:', { promise, reason });
  sentry.captureException(reason, { tags: { type: 'unhandledRejection' } });
});

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
process.once('SIGQUIT', onSignal);
