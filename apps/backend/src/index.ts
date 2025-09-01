import cron from 'node-cron';

import { logger as log } from 'nb-logger';

import { pgp } from '#libs/pgp';
import sentry from '#libs/sentry';

cron.schedule('*/15 * * * * *', './jobs/meta.js', { noOverlap: true }); // 15s

const onSignal = async (signal: number | string) => {
  try {
    await Promise.all([pgp.end(), sentry.close(1000)]);
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
