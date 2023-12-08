import { Redis } from 'ioredis';

import config from '#config';
import { errorHandler } from '#libs/utils';

type Options = {
  EX: number;
};

const redis = new Redis(config.redisUrl, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: null,
});

export const mainnetRedis = new Redis(config.userRedisUrl, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: null,
});

redis.on('error', errorHandler);
mainnetRedis.on('error', errorHandler);

const prefix = 'api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cache = async (key: string, callback: any, options: Options) => {
  const prefixedKey = `${prefix}:${key}`;
  const redisData = await redis.get(prefixedKey);

  if (redisData) {
    return JSON.parse(redisData);
  }

  const data = await callback();

  if (data) {
    await redis.setex(prefixedKey, options.EX, JSON.stringify(data));
  }

  return data;
};

export default redis;
