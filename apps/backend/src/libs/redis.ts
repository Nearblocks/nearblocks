import { Redis } from 'nb-redis';

import config from '#config';

export const redis = new Redis('api', { url: config.redisUrl });
export const redisClient = redis.getClient();

export const readCache = async (key: string) => {
  const redisData = await redisClient.get(key);

  if (redisData) {
    return JSON.parse(redisData);
  }
  return null;
};
