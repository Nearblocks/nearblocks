import { Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import { Keys, KeysCount } from '#libs/schema/account';
import { getPagination } from '#libs/utils';
import { RequestValidator } from '#types/types';

const keys = catchAsync(async (req: RequestValidator<Keys>, res: Response) => {
  const account = req.validator.data.account;
  const page = req.validator.data.page;
  const per_page = req.validator.data.per_page;
  const order = req.validator.data.order;

  const { limit, offset } = getPagination(page, per_page);
  const keys = await sql`
    SELECT
      public_key,
      account_id,
      permission_kind,
      JSON_BUILD_OBJECT(
        'transaction_hash',
        cbrt.transaction_hash,
        'block_timestamp',
        cbrt.block_timestamp
      ) AS created,
      JSON_BUILD_OBJECT(
        'transaction_hash',
        dbrt.transaction_hash,
        'block_timestamp',
        dbrt.block_timestamp
      ) AS deleted
    FROM
      access_keys a
      INNER JOIN (
        SELECT
          public_key,
          account_id
        FROM
          access_keys
        WHERE
          account_id = ${account}
        ORDER BY
          created_by_block_height ${order === 'desc' ? sql`DESC` : sql`ASC`}
        LIMIT
          ${limit}
        OFFSET
          ${offset}
      ) AS tmp using (public_key, account_id)
      LEFT JOIN receipts cbr ON cbr.receipt_id = a.created_by_receipt_id
      LEFT JOIN transactions cbrt ON cbrt.transaction_hash = cbr.originated_from_transaction_hash
      LEFT JOIN receipts dbr ON dbr.receipt_id = a.deleted_by_receipt_id
      LEFT JOIN transactions dbrt ON dbrt.transaction_hash = dbr.originated_from_transaction_hash
    ORDER BY
      created_by_block_height ${order === 'desc' ? sql`DESC` : sql`ASC`}
  `;

  return res.status(200).json({ keys });
});

const keysCount = catchAsync(
  async (req: RequestValidator<KeysCount>, res: Response) => {
    const account = req.validator.data.account;

    const keys = await sql`
      SELECT
        COUNT(account_id)
      FROM
        access_keys
      WHERE
        account_id = ${account}
    `;

    return res.status(200).json({ keys });
  },
);

export default { keys, keysCount };
