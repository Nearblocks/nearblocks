import { Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import { Item } from '#libs/schema/keys';
import { RequestValidator } from '#types/types';

const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const key = req.validator.data.key;

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
      LEFT JOIN temp_receipts cbr ON cbr.receipt_id = a.created_by_receipt_id
      LEFT JOIN temp_transactions cbrt ON cbrt.transaction_hash = cbr.originated_from_transaction_hash
      LEFT JOIN temp_receipts dbr ON dbr.receipt_id = a.deleted_by_receipt_id
      LEFT JOIN temp_transactions dbrt ON dbrt.transaction_hash = dbr.originated_from_transaction_hash
    WHERE
      public_key = ${key}
  `;

  return res.status(200).json({ keys });
});

export default { item };
