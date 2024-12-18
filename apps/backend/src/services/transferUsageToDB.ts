import { logger } from 'nb-logger';

import dayjs from '#libs/dayjs';
import { userKnex } from '#libs/knex';
import { ratelimiterRedisClient } from '#libs/ratelimiterRedis';

export const transferUsageToDB = async () => {
  const now = dayjs.utc();
  const yesterday = now.subtract(1, 'day').format('YYYY-MM-DD');

  try {
    const keys: string[] = await ratelimiterRedisClient.keys(
      `usage:*:${yesterday}`,
    );

    if (keys.length === 0) {
      logger.info('No usage keys found for yesterday.');
      return;
    }

    for (const key of keys) {
      try {
        const [, keyId, date] = key.split(':');
        if (!keyId || !date) {
          logger.error(`Invalid Redis key format: ${key}`);
          continue;
        }
        const usageData = await ratelimiterRedisClient.hgetall(key);

        const usageCount = Object.values(usageData).reduce(
          (sum, count) => sum + parseInt(count, 10),
          0,
        );

        await userKnex.raw(
          `INSERT INTO api__key_usages (key_id, time, count)
                       VALUES (?, ?, ?)
                       ON CONFLICT (key_id, time)
                       DO UPDATE SET count = api__key_usages.count + EXCLUDED.count
                   `,
          [keyId, date, usageCount],
        );

        await ratelimiterRedisClient.del(key);
        logger.info(`Processed and deleted key: ${key}`);
      } catch (error) {
        logger.error(`Error processing key: ${key}`);
        logger.error(error);
      }
    }
  } catch (error) {
    logger.error('Error fetching keys:', error);
  }
  logger.info('transferUsageToDB job completed.');
};
