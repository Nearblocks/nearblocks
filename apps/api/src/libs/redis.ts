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

  if (url.password) {
    options.password = url.password;
  }
}

if (config.redisSentinelName) {
  const urls = config.redisSentinelUrls.split('|').filter((u) => u);

  if (urls.length) {
    options = {
      name: config.redisSentinelName,
      sentinels: urls.map((u) => {
        const url = new URL(u);

        return { host: url.hostname, port: +url.port };
      }),
    };

    if (config.redisPassword) {
      options.password = config.redisPassword;
      options.sentinelPassword = config.redisPassword;
    }
  }
}

const redis = new Redis(`api:${config.network}`, options);

export const redisClient = redis.client();

redisClient.on('error', errorHandler);

export default redis;
