import sql from '#libs/postgres';
import redis from '#libs/redis';

const EXPIRY = 5; // 5s

export const getLatestReceipt = async () => {
  return redis.cache(
    'sync:receipt',
    async () => {
      return sql`
        SELECT
          included_in_block_timestamp
        FROM
          receipts
        ORDER BY
          included_in_block_timestamp DESC
        LIMIT
          1
      `;
    },
    EXPIRY, // 5s
  );
};
