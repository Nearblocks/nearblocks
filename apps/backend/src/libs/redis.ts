import { Redis, RedisOptions } from 'nb-redis';

import config from '#config';
import { errorHandler } from '#libs/utils';

let options: RedisOptions = {};

if (config.redisUrl) {
  const url = new URL(config.redisUrl);
  options = {
    host: url.hostname,
    port: +url.port,
  };
}

if (config.redisSentinel) {
  const urls = config.redisSentinel.split('|').filter((u) => u);

  if (urls.length) {
    options = {
      sentinels: urls.map((u) => {
        const url = new URL(u);

        return { host: url.hostname, port: +url.port };
      }),
    };
  }
}

const redis = new Redis(`backend:${config.network}`, options);
export const redisClient = redis.client();

redisClient.on('error', errorHandler);

export const createApiRedis = () => {
  return new Redis(`api:${config.network}`, { ...options, lazyConnect: true });
};

export default redis;
