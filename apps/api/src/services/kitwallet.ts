import { Response } from 'express';

import { Network } from 'nb-types';

import config from '#config';
import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import {
  Accounts,
  Nfts,
  NftsFromBlock,
  Tokens,
  TokensFromBlock,
} from '#libs/schema/kitwallet';
import { RequestValidator } from '#types/types';

const BRIDGE_TOKEN_FACTORY = 'factory.bridge.near';
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
    SELECT DISTINCT
      receipt_receiver_account_id AS receiver_account_id
    FROM
      action_receipt_actions
    WHERE
      args -> 'args_json' ->> 'receiver_id' = ${account}
      AND action_kind = 'FUNCTION_CALL'
      AND args ->> 'args_json' IS NOT NULL
      AND args ->> 'method_name' IN ('ft_transfer', 'ft_transfer_call', 'ft_mint')
      AND receipt_included_in_block_timestamp <= ${lastTimestamp}
      AND receipt_included_in_block_timestamp > ${timestamp}
    UNION
    SELECT DISTINCT
      receipt_receiver_account_id AS receiver_account_id
    FROM
      (
        SELECT
          args -> 'args_json' ->> 'account_id' AS account_id,
          receipt_receiver_account_id
        FROM
          action_receipt_actions
        WHERE
          action_kind = 'FUNCTION_CALL'
          AND receipt_predecessor_account_id = ${BRIDGE_TOKEN_FACTORY}
          AND args ->> 'method_name' = 'mint'
          AND receipt_included_in_block_timestamp <= ${lastTimestamp}
          AND receipt_included_in_block_timestamp > ${timestamp}
      ) minted_with_bridge
    WHERE
      account_id = ${account}
    UNION
    SELECT DISTINCT
      receipt_receiver_account_id AS receiver_account_id
    FROM
      action_receipt_actions
    WHERE
      receipt_predecessor_account_id = ${account}
      AND action_kind = 'FUNCTION_CALL'
      AND (
        args ->> 'method_name' LIKE 'ft_%'
        OR args ->> 'method_name' = 'storage_deposit'
      )
      AND receipt_included_in_block_timestamp <= ${lastTimestamp}
      AND receipt_included_in_block_timestamp > ${timestamp}
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

export default {
  accounts,
  nfts,
  nftsFromBlock,
  pools,
  tokens,
  tokensFromBlock,
};
