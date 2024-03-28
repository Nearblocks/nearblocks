import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import redis from '#libs/redis';
import { Item, Latest, List } from '#libs/schema/blocks';
import { getPagination } from '#libs/utils';
import { RequestValidator } from '#types/types';

const EXPIRY = 5; // 5 sec

const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const page = req.validator.data.page;
  const per_page = req.validator.data.per_page;

  const { limit, offset } = getPagination(page, per_page);
  const blocks = await sql`
    SELECT
      block_height,
      block_hash,
      block_timestamp,
      gas_price,
      author_account_id,
      (
        SELECT
          JSON_BUILD_OBJECT(
            'gas_used',
            COALESCE(SUM(gas_used), 0),
            'gas_limit',
            COALESCE(SUM(gas_limit), 0)
          )
        FROM
          chunks
        WHERE
          included_in_block_hash = blocks.block_hash
      ) AS chunks_agg,
      (
        SELECT
          JSON_BUILD_OBJECT('count', COUNT(included_in_block_hash))
        FROM
          transactions
        WHERE
          included_in_block_hash = blocks.block_hash
      ) AS transactions_agg,
      (
        SELECT
          JSON_BUILD_OBJECT('count', COUNT(included_in_block_hash))
        FROM
          receipts
        WHERE
          included_in_block_hash = blocks.block_hash
      ) AS receipts_agg
    FROM
      blocks
      INNER JOIN (
        SELECT
          block_height
        FROM
          blocks
        ORDER BY
          block_height DESC
        LIMIT
          ${limit}
        OFFSET
          ${offset}
      ) AS tmp USING (block_height)
    ORDER BY
      block_height DESC
  `;

  return res.status(200).json({ blocks });
});

const count = catchAsync(async (_req: Request, res: Response) => {
  const blocks = await sql`
    SELECT
      count_estimate (
        'SELECT block_height FROM blocks WHERE block_height > 0'
      ) AS count
  `;

  return res.status(200).json({ blocks });
});

const latest = catchAsync(
  async (req: RequestValidator<Latest>, res: Response) => {
    const limit = req.validator.data.limit;

    const query = sql`
      SELECT
        block_height,
        block_hash,
        block_timestamp,
        author_account_id,
        (
          SELECT
            JSON_BUILD_OBJECT('gas_used', COALESCE(SUM(gas_used), 0))
          FROM
            chunks
          WHERE
            included_in_block_hash = blocks.block_hash
        ) AS chunks_agg,
        (
          SELECT
            JSON_BUILD_OBJECT('count', COUNT(included_in_block_hash))
          FROM
            transactions
          WHERE
            included_in_block_hash = blocks.block_hash
        ) AS transactions_agg
      FROM
        blocks
      ORDER BY
        block_height DESC
      LIMIT
        ${limit}
    `;

    const blocks = await redis.cache(
      `blocks:latest:${limit}`,
      async () => {
        try {
          return await query;
        } catch (error) {
          return null;
        }
      },
      EXPIRY,
    );

    return res.status(200).json({ blocks });
  },
);

const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const hash = req.validator.data.hash;

  const blocks = await sql`
    SELECT
      block_height,
      block_hash,
      prev_block_hash,
      block_timestamp,
      gas_price,
      author_account_id,
      (
        SELECT
          JSON_BUILD_OBJECT(
            'gas_used',
            COALESCE(SUM(gas_used), 0),
            'gas_limit',
            COALESCE(SUM(gas_limit), 0),
            'shards',
            COUNT(included_in_block_hash)
          )
        FROM
          chunks
        WHERE
          included_in_block_hash = blocks.block_hash
      ) AS chunks_agg,
      (
        SELECT
          JSON_BUILD_OBJECT('count', COUNT(included_in_block_hash))
        FROM
          transactions
        WHERE
          included_in_block_hash = blocks.block_hash
      ) AS transactions_agg,
      (
        SELECT
          JSON_BUILD_OBJECT('count', COUNT(included_in_block_hash))
        FROM
          receipts
        WHERE
          included_in_block_hash = blocks.block_hash
      ) AS receipts_agg
    FROM
      blocks
    WHERE
      block_hash = ${hash}
    LIMIT
      1
  `;

  return res.status(200).json({ blocks });
});

export default { count, item, latest, list };
