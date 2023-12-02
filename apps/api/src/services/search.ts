import { Response } from 'express';

import catchAsync from '#libs/async';
import db from '#libs/db';
import { Item } from '#libs/schema/search';
import { keyBinder } from '#libs/utils';
import { RequestValidator } from '#types/types';

const txns = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const keyword = req.validator.data.keyword;

  const { query, values } = keyBinder(
    `
      SELECT
        transaction_hash
      FROM
        transactions
      WHERE
        transaction_hash = :keyword
      LIMIT
        1
    `,
    { keyword },
  );

  const { rows } = await db.query(query, values);

  return res.status(200).json({ txns: rows });
});

const blocks = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = req.validator.data.keyword;

    const { query, values } = keyBinder(
      `
        SELECT
          block_height,
          block_hash
        FROM
          blocks
        WHERE
          ${
            !isNaN(keyword)
              ? `block_height = ((:keyword) :: numeric)`
              : 'block_hash = ((:keyword) :: text)'
          }
        LIMIT
          1
      `,
      { keyword },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ blocks: rows });
  },
);

const accounts = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = req.validator.data.keyword;

    const { query, values } = keyBinder(
      `
        SELECT
          account_id
        FROM
          accounts
        WHERE
          account_id = :keyword
        LIMIT
          1
      `,
      { keyword },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ accounts: rows });
  },
);

const receipts = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = req.validator.data.keyword;

    const { query, values } = keyBinder(
      `
        SELECT
          receipt_id,
          originated_from_transaction_hash
        FROM
          receipts
        WHERE
          receipt_id = :keyword
        LIMIT
          1
      `,
      { keyword },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ receipts: rows });
  },
);

const search = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = req.validator.data.keyword;

    // search txn
    const { query, values } = keyBinder(
      `    
        SELECT
          transaction_hash
        FROM
          transactions
        WHERE
          transaction_hash = :keyword
        LIMIT
          1
      `,
      { keyword },
    );

    // search in block
    const { query: blockQry, values: blockValues } = keyBinder(
      `
        SELECT
          block_height,
          block_hash
        FROM
          blocks
        WHERE
          ${
            !isNaN(keyword)
              ? `block_height = ((:keyword) :: numeric)`
              : 'block_hash = ((:keyword) :: text)'
          }
        LIMIT 1
      `,
      { keyword },
    );

    // search account
    const { query: accountQry, values: accountValues } = keyBinder(
      `
        SELECT
          account_id
        FROM
          accounts
        WHERE
          account_id = :keyword
        LIMIT 5
      `,
      { keyword },
    );

    // search receipt
    const { query: receiptQry, values: receiptValues } = keyBinder(
      `
        SELECT
          receipt_id,
          originated_from_transaction_hash
        FROM
          receipts
        WHERE
          receipt_id = :keyword
        LIMIT  1
      `,
      { keyword },
    );

    const [txn, block, account, receipt] = await Promise.all([
      db.query(query, values),
      db.query(blockQry, blockValues),
      db.query(accountQry, accountValues),
      db.query(receiptQry, receiptValues),
    ]);

    return res.status(200).json({
      accounts: account.rows,
      blocks: block.rows,
      receipts: receipt.rows,
      txns: txn.rows,
    });
  },
);

export default { accounts, blocks, receipts, search, txns };
