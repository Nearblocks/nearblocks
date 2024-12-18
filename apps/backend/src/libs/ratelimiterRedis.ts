import { logger } from 'nb-logger';
import { Redis, RedisOptions } from 'nb-redis';

import config from '#config';
import { errorHandler } from '#libs/utils';

let options: RedisOptions = {};

if (config.ratelimiterRedisUrl) {
  const url = new URL(config.ratelimiterRedisUrl);
  logger.info(url);
  options = {
    host: url.hostname,
    port: +url.port,
  };

  if (url.password) {
    options.password = url.password;
  }
  logger.info(options);
}

if (config.ratelimiterRedisSentinelName) {
  const urls = config.ratelimiterRedisSentinelUrls.split('|').filter((u) => u);

  if (urls.length) {
    options = {
      name: config.ratelimiterRedisSentinelName,
      sentinels: urls.map((u) => {
        const url = new URL(u);

        return { host: url.hostname, port: +url.port };
      }),
    };

    if (config.ratelimiterRedisPassword) {
      options.password = config.ratelimiterRedisPassword;
      options.sentinelPassword = config.ratelimiterRedisPassword;
    }
  }
}

const ratelimiterRedis = new Redis(`user-api:${config.network}`, options);

export const ratelimiterRedisClient = ratelimiterRedis.client();

ratelimiterRedisClient.on('error', errorHandler);

export const createApiRedis = () => {
  return new Redis(`userdb:${config.network}`, {
    ...options,
    lazyConnect: true,
  });
};

export default ratelimiterRedis;
