import { Response } from 'express';

import db from '#libs/db';
import { cache } from '#libs/redis';
import catchAsync from '#libs/async';
import { keyBinder } from '#libs/utils';
import { RequestValidator } from '#ts/types';
import { viewAccount, viewCode, viewAccessKeys } from '#libs/near';
import {
  Item,
  Action,
  Tokens,
  Contract,
  Inventory,
  Deployments,
} from '#libs/schema/account';

const EXPIRY = 60; // 1 mins

const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const account = req.validator.data.account;

  const { query, values } = keyBinder(
    `
      SELECT
        a.account_id,
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
        accounts a
        LEFT JOIN receipts cbr ON cbr.receipt_id = a.created_by_receipt_id
        LEFT JOIN transactions cbrt ON cbrt.transaction_hash = cbr.originated_from_transaction_hash
        LEFT JOIN receipts dbr ON dbr.receipt_id = a.deleted_by_receipt_id
        LEFT JOIN transactions dbrt ON dbrt.transaction_hash = dbr.originated_from_transaction_hash
      WHERE
        a.account_id = :account
    `,
    { account },
  );

  const [actions, info] = await Promise.all([
    cache(
      `account:${account}:action`,
      async () => {
        try {
          const { rows } = await db.query(query, values);

          return rows;
        } catch (error) {
          return null;
        }
      },
      { EX: EXPIRY * 1 }, // 1 mins
    ),
    cache(
      `account:${account}`,
      async () => {
        try {
          return await viewAccount(account);
        } catch (error) {
          return null;
        }
      },
      { EX: EXPIRY * 1 }, // 1 mins
    ),
  ]);

  const action = actions?.[0] || {};

  return res.status(200).json({ account: [{ ...info, ...action }] });
});

const contract = catchAsync(
  async (req: RequestValidator<Contract>, res: Response) => {
    const account = req.validator.data.account;

    const [contract, key] = await Promise.all([
      cache(
        `contract:${account}`,
        async () => {
          try {
            return await viewCode(account);
          } catch (error) {
            return null;
          }
        },
        { EX: EXPIRY * 5 }, // 5 mins
      ),
      cache(
        `contract:${account}:keys`,
        async () => viewAccessKeys(account),
        { EX: EXPIRY * 5 }, // 5 mins
      ),
    ]);

    const keys = key.keys || [];
    const locked = keys.every(
      (key: any) => key.access_key.permission !== 'FullAccess',
    );

    return res
      .status(200)
      .json({ contract: [{ ...contract, keys: keys, locked }] });
  },
);

const deployments = catchAsync(
  async (req: RequestValidator<Deployments>, res: Response) => {
    const account = req.validator.data.account;

    const { query, values } = keyBinder(
      `
        SELECT
          transaction_hash,
          block_timestamp,
          receipt_predecessor_account_id
        FROM (
          SELECT
            t.transaction_hash as transaction_hash,
            t.block_timestamp as block_timestamp,
            a.receipt_predecessor_account_id as receipt_predecessor_account_id,
            ROW_NUMBER() OVER (ORDER BY t.block_timestamp ASC) as rank,
            COUNT(*) OVER () as total
          FROM
            action_receipt_actions a
            JOIN receipts r ON r.receipt_id = a.receipt_id
            JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
          WHERE
            a.receipt_receiver_account_id = :account
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
      `,
      { account },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ deployments: rows });
  },
);

const action = catchAsync(
  async (req: RequestValidator<Action>, res: Response) => {
    const account = req.validator?.data.account;
    const method = req.validator?.data.method;

    const { query, values } = keyBinder(
      `
        SELECT
          args
        FROM
          action_receipt_actions
        WHERE
          receipt_receiver_account_id = :account
          AND args ->> 'method_name' =  :method
        LIMIT
          1
      `,
      { account, method },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ action: rows });
  },
);

const inventory = catchAsync(
  async (req: RequestValidator<Inventory>, res: Response) => {
    const account = req.validator.data.account;

    const { query: ftQuery, values: ftValues } = keyBinder(
      `
        SELECT
          ft_holders.contract,
          ft_holders.amount,
          json_build_object(
            'name',
            ft.name,
            'symbol',
            ft.symbol,
            'decimals',
            ft.decimals,
            'icon',
            ft.icon,
            'reference',
            ft.reference,
            'price',
            ft.price
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
          ) AS ft ON TRUE
        WHERE
          ft_holders.account = :account
          AND ft_holders.amount > 0
        ORDER BY
          ft_holders.amount DESC
      `,
      { account },
    );

    const { query: nftQuery, values: nftValues } = keyBinder(
      `
        SELECT
          nft_holders.contract,
          nft_holders.quantity,
          json_build_object(
            'name',
            nft.name,
            'symbol',
            nft.symbol,
            'icon',
            nft.icon,
            'reference',
            nft.reference
          ) AS nft_meta
        FROM
          nft_holders
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
          ) AS nft ON TRUE
        WHERE
          nft_holders.account = :account
          AND nft_holders.quantity > 0
        ORDER BY
          nft_holders.quantity DESC
      `,
      { account },
    );

    const inventory = await cache(
      `account:${account}:inventory`,
      async () => {
        const [{ rows: fts }, { rows: nfts }] = await Promise.all([
          db.query(ftQuery, ftValues),
          db.query(nftQuery, nftValues),
        ]);

        return { fts, nfts };
      },
      { EX: EXPIRY * 15 }, // 15 mins
    );

    return res.status(200).json({ inventory });
  },
);

const tokens = catchAsync(
  async (req: RequestValidator<Tokens>, res: Response) => {
    const account = req.validator.data.account;

    const { query: ftQuery, values: ftValues } = keyBinder(
      `
        SELECT
          emitted_by_contract_account_id
        FROM
          assets__fungible_token_events
        WHERE
          token_old_owner_account_id = :account
        GROUP BY
          emitted_by_contract_account_id
        UNION
        SELECT
          emitted_by_contract_account_id
        FROM
          assets__fungible_token_events
        WHERE
          token_new_owner_account_id = :account
        GROUP BY
          emitted_by_contract_account_id
      `,
      { account },
    );

    const { query: nftQuery, values: nftValues } = keyBinder(
      `
        SELECT
          emitted_by_contract_account_id
        FROM
          assets__non_fungible_token_events
        WHERE
          token_old_owner_account_id = :account
        GROUP BY
          emitted_by_contract_account_id
        UNION
        SELECT
          emitted_by_contract_account_id
        FROM
          assets__non_fungible_token_events
        WHERE
          token_new_owner_account_id = :account
        GROUP BY
          emitted_by_contract_account_id
      `,
      { account },
    );

    const tokens = await cache(
      `account:${account}:tokens`,
      async () => {
        const [{ rows: fts }, { rows: nfts }] = await Promise.all([
          db.query(ftQuery, ftValues),
          db.query(nftQuery, nftValues),
        ]);

        const ftList = fts.map((ft) => ft.emitted_by_contract_account_id);
        const nftList = nfts.map((nft) => nft.emitted_by_contract_account_id);

        ftList.sort();
        nftList.sort();

        return { fts: ftList, nfts: nftList };
      },
      { EX: EXPIRY * 1 }, // 1 mins
    );

    return res.status(200).json({ tokens });
  },
);

export default {
  item,
  contract,
  deployments,
  action,
  inventory,
  tokens,
};
