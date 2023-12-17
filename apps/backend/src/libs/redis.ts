import { Redis } from 'nb-redis';

import config from '#config';

type Options = {
  EX: number;
};

export const redis = new Redis(`api:${config.network}`, {
  url: config.redisUrl,
});
export const redisClient = redis.getClient();

export const readCache = async (key: string) => {
  const redisData = await redisClient.get(key);

  if (redisData) {
    return JSON.parse(redisData);
  }
  return null;
};

export const cache = async (key: string, data: unknown, option: Options) => {
  await redisClient.set(
    redis.getPrefixedKeys(key),
    JSON.stringify(data),
    option,
  );
};
