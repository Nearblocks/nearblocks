import { Redis, RedisOptions } from 'nb-redis';

import config from '#config';
import { ratelimiterRedisClient } from '#libs/ratelimiterRedis';
import { errorHandler } from '#libs/utils';

/**
 * Client for the usage event stream. Uses a dedicated store when
 * USAGE_STREAM_REDIS_URL is set, so the stream's high write volume is isolated
 * from the rate-limiter store; otherwise falls back to the rate-limiter client.
 */
let client = ratelimiterRedisClient;

if (config.usageStreamRedisUrl) {
  const url = new URL(config.usageStreamRedisUrl);
  const options: RedisOptions = {
    host: url.hostname,
    port: +url.port,
  };

  const password = url.password || config.ratelimiterRedisPassword;
  if (password) {
    options.password = password;
  }

  const usageStreamRedis = new Redis(`usage-stream:${config.network}`, options);
  client = usageStreamRedis.client();
  client.on('error', errorHandler);
}

export const usageStreamRedisClient = client;
