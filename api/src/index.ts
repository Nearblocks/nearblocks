import app from './app.js';
import config from '#config';
import redis from '#libs/redis';
import logger from '#libs/logger';
import sentry from '#libs/sentry';

app.listen(config.port, async () => {
  logger.info(`server listening on port ${config.port}`);
});

const onSignal = (signal: string | number) => {
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
