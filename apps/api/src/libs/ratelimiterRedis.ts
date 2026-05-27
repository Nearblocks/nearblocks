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

  const password = url.password || config.ratelimiterRedisPassword;
  if (password) {
    ratelimiterOptions.password = password;
  }
}

if (!config.ratelimiterRedisUrl && config.ratelimiterRedisSentinelName) {
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
      ratelimiterOptions.sentinelPassword =
        config.ratelimiterRedisSentinelPassword;
    }
  }
}

// On READONLY (Dragonfly failover left us pinned to a read-only node), force a
// reconnect + resend so we re-resolve to the current master instead of failing
// every write until a manual pod restart.
ratelimiterOptions.reconnectOnError = (err: Error) =>
  err.message.includes('READONLY') ? 2 : false;

const ratelimiterRedis = new Redis(
  `user-api:${config.network}`,
  ratelimiterOptions,
);

export const ratelimiterRedisClient = ratelimiterRedis.client();

ratelimiterRedisClient.on('error', errorHandler);

export default ratelimiterRedis;
