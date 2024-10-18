import { Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import { Item } from '#libs/schema/search';
import { RequestValidator } from '#types/types';

const isHexAddress = (id: string) => /^0x[a-fA-F0-9]{40}$/.test(id);

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

const tokenQuery = (keyword: string) => {
  if (isHexAddress(keyword)) {
    const hex = keyword.toLowerCase();

    return sql`
      SELECT
        contract
      FROM
        ft_meta
      WHERE
        nep518_hex_address = ${hex}
      LIMIT
        1
    `;
  }

  return sql`
    SELECT
      contract
    FROM
      ft_meta
    WHERE
      contract = ${keyword}
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

const tokens = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = req.validator.data.keyword;
    const tokens = await tokenQuery(keyword);

    return res.status(200).json({ tokens });
  },
);

const search = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = req.validator.data.keyword;
    const [txns, blocks, accounts, receipts, tokens] = await Promise.all([
      txnQuery(keyword),
      blockQuery(keyword),
      accountQuery(keyword),
      receiptQuery(keyword),
      tokenQuery(keyword),
    ]);

    // The chances of a conflict should be infinitesimal. An account (a user's EOA) is derived from the keccak256 of the user's uncompressed Ethereum public key (64 bytes). Even if someone were to intentionally attempt to create such a conflict (considering they can create a named account consisting of 64 arbitrary characters allowed by NEAR for account addresses), they would need to find a private key that produces a public key consisting only of lowercase alphanumeric characters, dots, dashes, or underscores (when decoded as ASCII), which seems to be a practically infeasible task (would require on the order of 2^174 attempts to brute-force, according to my calculations).
    if (tokens.length > 0 && isHexAddress(keyword)) {
      accounts.length = 0;
    }

    return res.status(200).json({ accounts, blocks, receipts, tokens, txns });
  },
);

export default { accounts, blocks, receipts, search, tokens, txns };
