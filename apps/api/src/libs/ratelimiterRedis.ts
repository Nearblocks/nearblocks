import { Redis, RedisOptions } from 'nb-redis';

import config from '#config';
import { errorHandler } from '#libs/utils';

let ratelimiterOptions: RedisOptions = {};

if (config.ratelimiterRedisUrl) {
  const url = new URL(config.ratelimiterRedisUrl);
  ratelimiterOptions = {
    host: url.hostname,
    port: +url.port,
  };

  if (url.password) {
    ratelimiterOptions.password = url.password;
  }
}

if (config.ratelimiterRedisSentinelName) {
  const urls = config.ratelimiterRedisSentinelUrls.split('|').filter((u) => u);

  if (urls.length) {
    ratelimiterOptions = {
      name: config.ratelimiterRedisSentinelName,
      sentinels: urls.map((u) => {
        const url = new URL(u);

        return { host: url.hostname, port: +url.port };
      }),
    };

    if (config.ratelimiterRedisPassword) {
      ratelimiterOptions.password = config.ratelimiterRedisPassword;
      ratelimiterOptions.sentinelPassword = config.ratelimiterRedisSentinelPassword;
    }
  }
}

const ratelimiterRedis = new Redis(`user-api:${config.network}`, ratelimiterOptions);

export const ratelimiterRedisClient = ratelimiterRedis.client();

ratelimiterRedisClient.on('error', errorHandler);

export default ratelimiterRedis;
