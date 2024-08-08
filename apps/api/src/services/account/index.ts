import { Response } from 'express';
import { AccessKeyInfoView } from 'near-api-js/lib/providers/provider.js';
import parser from 'near-contract-parser';

import catchAsync from '#libs/async';
import logger from '#libs/logger';
import { viewAccessKeys, viewAccount, viewCode } from '#libs/near';
import sql from '#libs/postgres';
import redis from '#libs/redis';
import {
  Action,
  Contract,
  Deployments,
  Inventory,
  Item,
  Parse,
  Tokens,
} from '#libs/schema/account';
import { abiSchema } from '#libs/utils';
import { RequestValidator } from '#types/types';

const EXPIRY = 60; // 1 mins

const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const account = req.validator.data.account;

  const query = sql`
    SELECT
      a.account_id,
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
      accounts a
      LEFT JOIN receipts cbr ON cbr.receipt_id = a.created_by_receipt_id
      LEFT JOIN transactions cbrt ON cbrt.transaction_hash = cbr.originated_from_transaction_hash
      LEFT JOIN receipts dbr ON dbr.receipt_id = a.deleted_by_receipt_id
      LEFT JOIN transactions dbrt ON dbrt.transaction_hash = dbr.originated_from_transaction_hash
    WHERE
      a.account_id = ${account}
  `;

  const [actions, info] = await Promise.all([
    redis.cache(
      `account:${account}:action`,
      async () => {
        try {
          return await query;
        } catch (error) {
          return null;
        }
      },
      EXPIRY * 1, // 1 mins
    ),
    redis.cache(
      `account:${account}`,
      async () => {
        try {
          return await viewAccount(account);
        } catch (error) {
          return null;
        }
      },
      EXPIRY * 1, // 1 mins
    ),
  ]);

  const action = actions?.[0] || {};

  return res.status(200).json({ account: [{ ...info, ...action }] });
});

const contract = catchAsync(
  async (req: RequestValidator<Contract>, res: Response) => {
    const account = req.validator.data.account;

    const [contract, key] = await Promise.all([
      redis.cache(
        `contract:${account}`,
        async () => {
          try {
            return await viewCode(account);
          } catch (error) {
            return null;
          }
        },
        EXPIRY * 5, // 5 mins
      ),
      redis.cache(
        `contract:${account}:keys`,
        async () => viewAccessKeys(account),
        EXPIRY * 5, // 5 mins
      ),
    ]);

    const keys = key.keys || [];
    const locked = keys.every((key: AccessKeyInfoView) => {
      key.access_key.permission !== 'FullAccess';
    });

    return res
      .status(200)
      .json({ contract: [{ ...contract, keys: keys, locked }] });
  },
);

const parse = catchAsync(
  async (req: RequestValidator<Parse>, res: Response) => {
    let code = null;
    let contract = null;
    let schema = null;
    const account = req.validator.data.account;

    try {
      code = await redis.cache(
        `contract:${account}`,
        async () => viewCode(account),
        EXPIRY * 5, // 5 mins
      );
    } catch (error) {
      logger.error({ contractViewError: error });
    }

    try {
      if (code?.code_base64) {
        contract = await parser.parseContract(code.code_base64);
      }
    } catch (error) {
      logger.error({ contractParseError: error });
    }

    try {
      schema = await abiSchema(account);
    } catch (error) {
      // logger.error({ abiSchemaError: error });
    }

    return res.status(200).json({ contract: [{ contract, schema }] });
  },
);

const deployments = catchAsync(
  async (req: RequestValidator<Deployments>, res: Response) => {
    const account = req.validator.data.account;

    const deployments = await sql`
      SELECT
        transaction_hash,
        block_timestamp,
        receipt_predecessor_account_id
      FROM
        (
          SELECT
            t.transaction_hash as transaction_hash,
            t.block_timestamp as block_timestamp,
            a.receipt_predecessor_account_id as receipt_predecessor_account_id,
            ROW_NUMBER() OVER (
              ORDER BY
                t.block_timestamp ASC
            ) as rank,
            COUNT(*) OVER () as total
          FROM
            action_receipt_actions a
            JOIN receipts r ON r.receipt_id = a.receipt_id
            JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
          WHERE
            a.receipt_receiver_account_id = ${account}
            AND a.action_kind = 'DEPLOY_CONTRACT'
            AND EXISTS (
              SELECT
                1
              FROM
                execution_outcomes e
              WHERE
                e.receipt_id = a.receipt_id
                AND (
                  e.status = 'SUCCESS_RECEIPT_ID'
                  OR e.status = 'SUCCESS_VALUE'
                )
            )
        ) tmp
      WHERE
        rank = 1
        OR rank = total
      ORDER BY
        block_timestamp ASC
    `;

    return res.status(200).json({ deployments });
  },
);

const action = catchAsync(
  async (req: RequestValidator<Action>, res: Response) => {
    const account = req.validator?.data.account;
    const method = req.validator?.data.method;

    const action = await sql`
      SELECT
        args
      FROM
        action_receipt_actions
      WHERE
        receipt_receiver_account_id = ${account}
        AND args ->> 'method_name' = ${method}
      LIMIT
        1
    `;

    return res.status(200).json({ action });
  },
);

const inventory = catchAsync(
  async (req: RequestValidator<Inventory>, res: Response) => {
    const account = req.validator.data.account;

    const ftQuery = sql`
      SELECT
        ft_holders.contract,
        ft_holders.amount,
        JSON_BUILD_OBJECT(
          'name',
          meta.name,
          'symbol',
          meta.symbol,
          'decimals',
          meta.decimals,
          'icon',
          meta.icon,
          'reference',
          meta.reference,
          'price',
          meta.price
        ) AS ft_meta
      FROM
        ft_holders
        INNER JOIN LATERAL (
          SELECT
            contract,
            name,
            symbol,
            decimals,
            icon,
            reference,
            price
          FROM
            ft_meta
          WHERE
            ft_meta.contract = ft_holders.contract
        ) AS meta ON TRUE
      WHERE
        ft_holders.account = ${account}
        AND ft_holders.amount > 0
    `;

    const nftQuery = sql`
      SELECT
        nft_holders.*,
        JSON_BUILD_OBJECT(
          'name',
          meta.name,
          'symbol',
          meta.symbol,
          'icon',
          meta.icon,
          'reference',
          meta.reference
        ) AS nft_meta
      FROM
        (
          SELECT
            nft_holders.contract,
            SUM(nft_holders.quantity) AS quantity
          FROM
            (
              SELECT
                contract,
                quantity
              FROM
                nft_holders
              WHERE
                account = ${account}
                AND quantity > 0
            ) nft_holders
          GROUP BY
            nft_holders.contract
          ORDER BY
            SUM(nft_holders.quantity) DESC
        ) nft_holders
        INNER JOIN LATERAL (
          SELECT
            contract,
            name,
            symbol,
            icon,
            reference
          FROM
            nft_meta
          WHERE
            nft_meta.contract = nft_holders.contract
        ) AS meta ON TRUE
    `;

    const inventory = await redis.cache(
      `account:${account}:inventory`,
      async () => {
        const [fts, nfts] = await Promise.all([ftQuery, nftQuery]);

        return { fts, nfts };
      },
      EXPIRY * 1, // 1 mins
    );

    return res.status(200).json({ inventory });
  },
);

const tokens = catchAsync(
  async (req: RequestValidator<Tokens>, res: Response) => {
    const account = req.validator.data.account;

    const ftQuery = sql`
      SELECT
        contract_account_id
      FROM
        ft_events
      WHERE
        affected_account_id = ${account}
      GROUP BY
        contract_account_id
    `;

    const nftQuery = sql`
      SELECT
        contract_account_id
      FROM
        nft_events
      WHERE
        affected_account_id = ${account}
      GROUP BY
        contract_account_id
    `;

    const tokens = await redis.cache(
      `account:${account}:tokens`,
      async () => {
        const [fts, nfts] = await Promise.all([ftQuery, nftQuery]);

        const ftList = fts.map((ft) => ft.contract_account_id);
        const nftList = nfts.map((nft) => nft.contract_account_id);

        ftList.sort();
        nftList.sort();

        return { fts: ftList, nfts: nftList };
      },
      EXPIRY * 1, // 1 mins
    );

    return res.status(200).json({ tokens });
  },
);

export default {
  action,
  contract,
  deployments,
  inventory,
  item,
  parse,
  tokens,
};
