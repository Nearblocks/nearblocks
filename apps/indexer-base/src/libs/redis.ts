import { Redis } from 'nb-redis';

import config from '#config';

export const redis = new Redis(`base:${config.network}`, {
  url: config.redisUrl,
});
export const redisClient = redis.getClient();
