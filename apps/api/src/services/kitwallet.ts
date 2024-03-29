import { Response } from 'express';

import { Network } from 'nb-types';

import config from '#config';
import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import {
  Accounts,
  Activities,
  Deposits,
  Nfts,
  NftsFromBlock,
  Receivers,
  Tokens,
  TokensFromBlock,
} from '#libs/schema/kitwallet';
import { RequestValidator } from '#types/types';

const POOLS =
  config.network === Network.MAINNET
    ? ['%.poolv1.near', '%.pool.near']
    : [
        '%.pool.%.m0',
        '%.factory01.littlefarm.testnet',
        '%.factory.colorpalette.testnet',
      ];

const getLastBlockTimestamp = async () => {
  const [{ block_timestamp: lastTimestamp }] = await sql`
    SELECT
      block_timestamp
    FROM
      blocks
    ORDER BY
      block_timestamp DESC
    LIMIT
      1
  `;

  return lastTimestamp;
};

const getLikelyTokens = async (
  account: string,
  timestamp: number,
  lastTimestamp: string,
) => {
  const tokens = await sql`
    SELECT
      contract_account_id AS receiver_account_id
    FROM
      ft_events
    WHERE
      affected_account_id = ${account}
      AND block_timestamp <= ${lastTimestamp}
      AND block_timestamp > ${timestamp}
    GROUP BY
      contract_account_id
  `;

  return tokens;
};

const getLikelyNfts = async (
  account: string,
  timestamp: number,
  lastTimestamp: string,
) => {
  const tokens = await sql`
    SELECT DISTINCT
      receipt_receiver_account_id AS receiver_account_id
    FROM
      action_receipt_actions
    WHERE
      args -> 'args_json' ->> 'receiver_id' = ${account}
      AND action_kind = 'FUNCTION_CALL'
      AND args ->> 'args_json' IS NOT NULL
      AND args ->> 'method_name' LIKE 'nft_%'
      AND receipt_included_in_block_timestamp <= ${lastTimestamp}
      AND receipt_included_in_block_timestamp > ${timestamp}
    UNION
    SELECT DISTINCT
      contract_account_id AS receiver_account_id
    FROM
      nft_events
    WHERE
      affected_account_id = ${account}
      AND block_timestamp <= ${lastTimestamp}
      AND block_timestamp > ${timestamp}
  `;

  return tokens;
};

const tokens = catchAsync(
  async (req: RequestValidator<Tokens>, res: Response) => {
    const account = req.validator.data.account;

    const lastBlockTimestamp = await getLastBlockTimestamp();
    const tokens = await getLikelyTokens(account, 0, lastBlockTimestamp);

    return res
      .status(200)
      .json(tokens.map(({ receiver_account_id }) => receiver_account_id));
  },
);

const tokensFromBlock = catchAsync(
  async (req: RequestValidator<TokensFromBlock>, res: Response) => {
    const account = req.validator.data.account;
    const timestamp = req.validator.data.fromBlockTimestamp;

    const lastBlockTimestamp = await getLastBlockTimestamp();
    const tokens = await getLikelyTokens(
      account,
      timestamp,
      lastBlockTimestamp,
    );

    return res.status(200).json({
      lastBlockTimestamp,
      list: tokens.map(({ receiver_account_id }) => receiver_account_id),
      version: '1.0.0',
    });
  },
);

const nfts = catchAsync(async (req: RequestValidator<Nfts>, res: Response) => {
  const account = req.validator.data.account;

  const lastBlockTimestamp = await getLastBlockTimestamp();
  const nfts = await getLikelyNfts(account, 0, lastBlockTimestamp);

  return res
    .status(200)
    .json(nfts.map(({ receiver_account_id }) => receiver_account_id));
});

const nftsFromBlock = catchAsync(
  async (req: RequestValidator<NftsFromBlock>, res: Response) => {
    const account = req.validator.data.account;
    const timestamp = req.validator.data.fromBlockTimestamp;

    const lastBlockTimestamp = await getLastBlockTimestamp();
    const nfts = await getLikelyNfts(account, timestamp, lastBlockTimestamp);

    return res.status(200).json({
      lastBlockTimestamp,
      list: nfts.map(({ receiver_account_id }) => receiver_account_id),
      version: '1.0.0',
    });
  },
);

const accounts = catchAsync(
  async (req: RequestValidator<Accounts>, res: Response) => {
    const key = req.validator.data.key;

    const accounts = await sql`
      SELECT DISTINCT
        account_id
      FROM
        access_keys
        JOIN accounts USING (account_id)
      WHERE
        public_key = ${key}
        AND accounts.deleted_by_receipt_id IS NULL
        AND access_keys.deleted_by_receipt_id IS NULL
    `;

    return res.status(200).json(accounts.map(({ account_id }) => account_id));
  },
);

const pools = catchAsync(async (_req: Request, res: Response) => {
  const pools = await sql`
    SELECT
      account_id
    FROM
      accounts
    WHERE
      account_id LIKE ANY (${POOLS})
  `;

  return res.status(200).json(pools.map(({ account_id }) => account_id));
});

const deposits = catchAsync(
  async (req: RequestValidator<Deposits>, res: Response) => {
    const account = req.validator.data.account;

    const deposits = await sql`
      WITH
        deposit_in AS (
          SELECT
            SUM(
              TO_NUMBER(
                args ->> 'deposit',
                '99999999999999999999999999999999999999'
              )
            ) deposit,
            receipt_receiver_account_id validator_id
          FROM
            action_receipt_actions
          WHERE
            action_kind = 'FUNCTION_CALL'
            AND args ->> 'method_name' LIKE 'deposit%'
            AND receipt_predecessor_account_id = ${account}
            AND receipt_receiver_account_id LIKE ANY (${POOLS})
          GROUP BY
            receipt_receiver_account_id
        ),
        deposit_out AS (
          SELECT
            SUM(
              TO_NUMBER(
                args ->> 'deposit',
                '99999999999999999999999999999999999999'
              )
            ) deposit,
            receipt_predecessor_account_id validator_id
          FROM
            action_receipt_actions
          WHERE
            action_kind = 'TRANSFER'
            AND receipt_receiver_account_id = ${account}
            AND receipt_predecessor_account_id LIKE ANY (${POOLS})
          GROUP BY
            receipt_predecessor_account_id
        )
      SELECT
        SUM(
          deposit_in.deposit - COALESCE(deposit_out.deposit, 0)
        ) deposit,
        deposit_in.validator_id
      FROM
        deposit_in
        LEFT JOIN deposit_out ON deposit_in.validator_id = deposit_out.validator_id
      GROUP BY
        deposit_in.validator_id
    `;

    return res.status(200).json(deposits);
  },
);

const activities = catchAsync(
  async (req: RequestValidator<Activities>, res: Response) => {
    const account = req.validator.data.account;
    const limit = req.validator.data.limit;
    const offset = String(req.validator.data.offset ?? '9223372036854775807');

    const activities = await sql`
      SELECT
        included_in_block_hash block_hash,
        included_in_block_timestamp block_timestamp,
        originated_from_transaction_hash hash,
        index_in_action_receipt action_index,
        predecessor_account_id signer_id,
        receiver_account_id receiver_id,
        action_kind,
        args
      FROM
        action_receipt_actions
        JOIN receipts USING (receipt_id)
      WHERE
        receipt_predecessor_account_id != 'system'
        AND (
          receipt_predecessor_account_id = ${account}
          OR receipt_receiver_account_id = ${account}
        )
        AND ${offset} > receipt_included_in_block_timestamp
      ORDER BY
        receipt_included_in_block_timestamp DESC
      LIMIT
        ${limit + 100}
    `;

    return res.status(200).json(activities.slice(0, limit));
  },
);

const receivers = catchAsync(
  async (req: RequestValidator<Receivers>, res: Response) => {
    const account = req.validator.data.account;

    const pools = await sql`
      SELECT DISTINCT
        receipt_receiver_account_id AS receiver_account_id
      FROM
        action_receipt_actions
      WHERE
        receipt_predecessor_account_id = ${account}
        AND action_kind = 'FUNCTION_CALL'
    `;

    return res
      .status(200)
      .json(pools.map(({ receiver_account_id }) => receiver_account_id));
  },
);

export default {
  accounts,
  activities,
  deposits,
  nfts,
  nftsFromBlock,
  pools,
  receivers,
  tokens,
  tokensFromBlock,
};
