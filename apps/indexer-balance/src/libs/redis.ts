import redisLock from 'redis-lock';

import { Redis } from 'nb-redis';

import config from '#config';

export const redis = new Redis('balance', { url: config.redisUrl });
export const redisClient = redis.getClient();
export const redLock = redisLock(redisClient);
