import { Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import { Item } from '#libs/schema/search';
import { RequestValidator } from '#types/types';

const txnQuery = (keyword: string) => {
  if (keyword.startsWith('0x')) {
    return sql`
      SELECT
        r.originated_from_transaction_hash AS transaction_hash
      FROM
        receipts r
        JOIN action_receipt_actions ara ON r.receipt_id = ara.receipt_id
      WHERE
        ara.nep518_rlp_hash = ${keyword}
      LIMIT
        1
    `;
  }

  return sql`
    SELECT
      transaction_hash
    FROM
      transactions
    WHERE
      transaction_hash = ${keyword}
    LIMIT
      1
  `;
};

const blockQuery = (keyword: string) => {
  const query = keyword.replace(/^0x/, '');

  return sql`
    SELECT
      block_height,
      block_hash
    FROM
      blocks
    WHERE
      ${!isNaN(+query)
      ? sql`block_height = ${query}`
      : sql`block_hash = ${query}`}
    LIMIT
      1
  `;
};

const accountQuery = (keyword: string) => {
  return sql`
    SELECT
      account_id
    FROM
      accounts
    WHERE
      account_id = ${keyword.toString().toLocaleLowerCase()}
    LIMIT
      1
  `;
};

const receiptQuery = (keyword: string) => {
  return sql`
    SELECT
      receipt_id,
      originated_from_transaction_hash
    FROM
      receipts
    WHERE
      receipt_id = ${keyword}
    LIMIT
      1
  `;
};

const txns = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const keyword = req.validator.data.keyword;
  const txns = await txnQuery(keyword);

  return res.status(200).json({ txns });
});

const blocks = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = req.validator.data.keyword;
    const blocks = await blockQuery(keyword);

    return res.status(200).json({ blocks });
  },
);

const accounts = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = req.validator.data.keyword;
    const accounts = await accountQuery(keyword);

    return res.status(200).json({ accounts });
  },
);

const receipts = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = req.validator.data.keyword;
    const receipts = await receiptQuery(keyword);

    return res.status(200).json({ receipts });
  },
);

const search = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = req.validator.data.keyword;
    const [txns, blocks, accounts, receipts] = await Promise.all([
      txnQuery(keyword),
      blockQuery(keyword),
      accountQuery(keyword),
      receiptQuery(keyword),
    ]);

    return res.status(200).json({ accounts, blocks, receipts, txns });
  },
);

export default { accounts, blocks, receipts, search, txns };
