import config from '#config';
import logger from '#libs/logger';
import redis from '#libs/redis';
import sentry from '#libs/sentry';

import app from './app.js';

app.listen(config.port, async () => {
  logger.info(`server listening on port ${config.port}`);
});

const onSignal = (signal: number | string) => {
  const handler = async () => {
    await redis.quit();
    await sentry.close(1000);
  };

  handler()
    .catch(logger.error)
    .finally(() => process.kill(process.pid, signal));
};

process.once('SIGINT', onSignal);
process.once('SIGTERM', onSignal);
