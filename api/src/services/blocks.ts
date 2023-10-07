import { Request, Response } from 'express';

import db from '#libs/db';
import { cache } from '#libs/redis';
import catchAsync from '#libs/async';
import { RequestValidator } from '#ts/types';
import { keyBinder, getPagination } from '#libs/utils';
import { List, Latest, Item } from '#libs/schema/blocks';

const EXPIRY = 5; // 5 sec

const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const page = req.validator.data.page;
  const per_page = req.validator.data.per_page;

  const { limit, offset } = getPagination(page, per_page);
  const { query, values } = keyBinder(
    `
      SELECT
        block_height,
        block_hash,
        block_timestamp,
        gas_price,
        author_account_id,
        (
          SELECT
            json_build_object(
              'gas_used',
              COALESCE(SUM (gas_used), 0),
              'gas_limit',
              COALESCE(SUM (gas_limit), 0)
            )
          FROM
            chunks
          WHERE
            included_in_block_hash = blocks.block_hash
        ) AS chunks_agg,
        (
          SELECT
            json_build_object(
              'count',
              COUNT (included_in_block_hash)
            )
          FROM
            transactions
          WHERE
            included_in_block_hash = blocks.block_hash
        ) AS transactions_agg,
        (
          SELECT
            json_build_object(
              'count',
              COUNT (included_in_block_hash)
            )
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
            :limit OFFSET :offset
        ) AS tmp using(block_height)
      ORDER BY
        block_height DESC
    `,
    { limit, offset },
  );

  const { rows } = await db.query(query, values);

  return res.status(200).json({ blocks: rows });
});

const count = catchAsync(async (_req: Request, res: Response) => {
  const { rows } = await db.query(
    `
      SELECT count_estimate('${`
        SELECT
          block_height
        FROM
          blocks
        WHERE
          block_height > 0
      `}') as count
    `,
  );

  return res.status(200).json({ blocks: rows });
});

const latest = catchAsync(
  async (req: RequestValidator<Latest>, res: Response) => {
    const limit = req.validator.data.limit;

    const { query, values } = keyBinder(
      `
        SELECT
          block_height,
          block_hash,
          block_timestamp,
          author_account_id,
          (
            SELECT
              json_build_object(
                'gas_used',
                COALESCE(SUM (gas_used), 0)
              )
            FROM
              chunks
            WHERE
              included_in_block_hash = blocks.block_hash
          ) AS chunks_agg,
          (
            SELECT
              json_build_object(
                'count',
                COUNT (included_in_block_hash)
              )
            FROM
              transactions
            WHERE
              included_in_block_hash = blocks.block_hash
          ) AS transactions_agg
        FROM
          blocks
        ORDER BY
          block_height DESC
        LIMIT :limit
      `,
      { limit },
    );

    const blocks = await cache(
      `blocks:latest:${limit}`,
      async () => {
        try {
          const { rows } = await db.query(query, values);

          return rows;
        } catch (error) {
          return null;
        }
      },
      { EX: EXPIRY },
    );

    return res.status(200).json({ blocks });
  },
);

const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const hash = req.validator.data.hash;

  const { query, values } = keyBinder(
    `
      SELECT
        block_height,
        block_hash,
        prev_block_hash,
        block_timestamp,
        gas_price,
        author_account_id,
        (
          SELECT
            json_build_object(
              'gas_used',
              COALESCE(SUM (gas_used), 0),
              'gas_limit',
              COALESCE(SUM (gas_limit), 0)
            )
          FROM
            chunks
          WHERE
            included_in_block_hash = blocks.block_hash
        ) AS chunks_agg,
        (
          SELECT
            json_build_object(
              'count',
              COUNT (included_in_block_hash)
            )
          FROM
            transactions
          WHERE
            included_in_block_hash = blocks.block_hash
        ) AS transactions_agg,
        (
          SELECT
            json_build_object(
              'count',
              COUNT (included_in_block_hash)
            )
          FROM
            receipts
          WHERE
            included_in_block_hash = blocks.block_hash
        ) AS receipts_agg
      FROM
        blocks
      WHERE
        block_hash = :hash
      LIMIT 1
    `,
    { hash },
  );

  const { rows } = await db.query(query, values);

  return res.status(200).json({ blocks: rows });
});

export default { list, count, latest, item };
