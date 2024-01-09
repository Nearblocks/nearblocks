import { Response } from 'express';

import catchAsync from '#libs/async';
import db from '#libs/db';
import { Item } from '#libs/schema/key';
import { keyBinder } from '#libs/utils';
import { RequestValidator } from '#types/types';

const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const key = req.validator.data.key;

  const { query, values } = keyBinder(
    `
      SELECT
        public_key,
        account_id,
        permission_kind,
        json_build_object(
          'transaction_hash',
          cbrt.transaction_hash,
          'block_timestamp',
          cbrt.block_timestamp
        ) AS created,
        json_build_object(
          'transaction_hash',
          dbrt.transaction_hash,
          'block_timestamp',
          dbrt.block_timestamp
        ) AS deleted
      FROM
        access_keys a
        LEFT JOIN receipts cbr ON cbr.receipt_id = a.created_by_receipt_id
        LEFT JOIN transactions cbrt ON cbrt.transaction_hash = cbr.originated_from_transaction_hash
        LEFT JOIN receipts dbr ON dbr.receipt_id = a.deleted_by_receipt_id
        LEFT JOIN transactions dbrt ON dbrt.transaction_hash = dbr.originated_from_transaction_hash
      WHERE
        public_key = :key
    `,
    { key },
  );

  const { rows } = await db.query(query, values);

  return res.status(200).json({ keys: rows });
});

export default {
  item,
};
