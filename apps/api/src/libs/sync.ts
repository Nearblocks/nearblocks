import { Block, Setting } from 'nb-types';

import sql from '#libs/postgres';
import redis from '#libs/redis';

const EXPIRY = 5; // 5s

export const getLatestBlock = async (): Promise<
  Pick<Block, 'block_height' | 'block_timestamp'>[]
> => {
  return redis.cache(
    'sync:block',
    async () => {
      return sql`
        SELECT
          block_height,
          block_timestamp
        FROM
          blocks
        ORDER BY
          block_height DESC
        LIMIT
          1
      `;
    },
    EXPIRY,
  );
};

export const getLatestReceipt = async (): Promise<
  Pick<Block, 'block_height' | 'block_timestamp'>[]
> => {
  return redis.cache(
    'sync:receipt',
    async () => {
      return sql`
        SELECT
          b.block_height,
          b.block_timestamp
        FROM
          receipts r
          JOIN blocks b ON r.included_in_block_hash = b.block_hash
        ORDER BY
          r.included_in_block_timestamp DESC
        LIMIT
          1
      `;
    },
    EXPIRY,
  );
};

export const getBlock = (
  block: number,
): Promise<Pick<Block, 'block_height' | 'block_timestamp'>[]> => {
  return redis.cache(
    `sync:block:${block}`,
    async () => {
      return sql`
        SELECT
          block_height,
          block_timestamp
        FROM
          blocks
        WHERE
          block_height IN ${sql([block, +block - 1, +block - 2])}
      `;
    },
    EXPIRY,
  );
};

export const getSettings = async (): Promise<Setting[]> => {
  return redis.cache(
    'sync:settings',
    async () => {
      return sql`
        SELECT
          *
        FROM
          settings
      `;
    },
    EXPIRY,
  );
};

export const getLatestStats = async () => {
  return redis.cache(
    `sync:stats`,
    async () => {
      return sql`
        SELECT
          date
        FROM
          daily_stats_new
        ORDER BY
          date DESC
        LIMIT
          1
      `;
    },
    EXPIRY,
  );
};
