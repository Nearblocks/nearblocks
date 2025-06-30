import { Response } from 'express';
import { QueryResponseKind } from 'near-api-js/lib/providers/provider.js';
import parser from 'near-contract-parser';

import catchAsync from '#libs/async';
import { getProvider, viewCode } from '#libs/near';
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

  const actionQuery = sql`
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

  const infoQuery = sql`
    SELECT
      be.absolute_staked_amount,
      be.absolute_nonstaked_amount
    FROM
      balance_events AS be
    WHERE
      be.affected_account_id = ${account}
    ORDER BY
      be.event_index DESC
    LIMIT
      1;
  `;

  const blockQuery = sql`
    SELECT
      block_height,
      block_hash
    FROM
      blocks
    ORDER BY
      block_height DESC
    LIMIT
      1
  `;

  const [actionResult, infoResult, blockResult] = await Promise.all([
    actionQuery,
    infoQuery,
    blockQuery,
  ]);

  const info = infoResult[0]
    ? {
        amount: infoResult[0].absolute_nonstaked_amount || '0',
        block_hash: infoResult[0].block_hash || null,
        block_height: Number(infoResult[0].block_height) || null,
        locked: infoResult[0].absolute_staked_amount || '0',
      }
    : {};

  const action = actionResult[0] || {};
  const block = blockResult[0] || {};

  return res.status(200).json({ account: [{ ...action, ...info, ...block }] });
});

const contract = catchAsync(
  async (req: RequestValidator<Contract>, res: Response) => {
    const account = req.validator.data.account;
    const provider = getProvider();

    const [contract, key] = await Promise.all([
      redis.cache(
        `contract:${account}:code`,
        async () => {
          try {
            return await viewCode(provider, account);
          } catch (error) {
            return null;
          }
        },
        EXPIRY * 5, // 5 mins
      ),
      sql`
        SELECT
          COALESCE(
            NOT BOOL_OR(permission_kind = 'FULL_ACCESS'),
            TRUE
          ) AS locked
        FROM
          access_keys
        WHERE
          account_id = ${account}
          AND deleted_by_block_height IS NULL
      `,
    ]);

    if (!contract) return res.status(200).json({ contract: [] });

    return res
      .status(200)
      .json({ contract: [{ ...contract, locked: key?.[0]?.locked }] });
  },
);

const parse = catchAsync(
  async (req: RequestValidator<Parse>, res: Response) => {
    let contract = null;
    let schema = null;
    const account = req.validator.data.account;
    const provider = getProvider();

    [contract, schema] = await Promise.all([
      redis.cache(
        `contract:${account}`,
        async () => {
          try {
            const code = (await redis.cache(
              `contract:${account}:code`,
              async () => {
                try {
                  return await viewCode(provider, account);
                } catch (error) {
                  return null;
                }
              },
              EXPIRY * 5, // 5 mins
            )) as QueryResponseKind & { code_base64?: string };

            if (code?.code_base64) {
              return await parser.parseContract(code.code_base64);
            }

            return null;
          } catch (error) {
            return null;
          }
        },
        EXPIRY * 5, // 5 mins
      ),
      redis.cache(
        `contract:${account}:abi`,
        async () => {
          try {
            return await abiSchema(provider, account);
          } catch (error) {
            return null;
          }
        },
        EXPIRY * 5, // 5 mins
      ),
    ]);

    return res.status(200).json({ contract: [{ contract, schema }] });
  },
);

const deployments = catchAsync(
  async (req: RequestValidator<Deployments>, res: Response) => {
    const account = req.validator.data.account;

    const deployments = await sql`
      SELECT
        t.transaction_hash,
        t.block_timestamp,
        r.predecessor_account_id as receipt_predecessor_account_id
      FROM
        (
          (
            SELECT
              receipt_id
            FROM
              deployed_contracts
            WHERE
              contract = ${account}
            ORDER BY
              block_timestamp ASC
            LIMIT
              1
          )
          UNION
          (
            SELECT
              receipt_id
            FROM
              deployed_contracts
            WHERE
              contract = ${account}
            ORDER BY
              block_timestamp DESC
            LIMIT
              1
          )
        ) c
        JOIN receipts r ON r.receipt_id = c.receipt_id
        JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
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
        ft_holders_new.contract,
        ft_holders_new.amount,
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
        ft_holders_new
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
            ft_meta.contract = ft_holders_new.contract
        ) AS meta ON TRUE
      WHERE
        ft_holders_new.account = ${account}
        AND ft_holders_new.amount > 0
    `;

    const nftQuery = sql`
      SELECT
        nft_holders_new.*,
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
            nft_holders_new.contract,
            SUM(nft_holders_new.quantity) AS quantity
          FROM
            (
              SELECT
                contract,
                quantity
              FROM
                nft_holders_new
              WHERE
                account = ${account}
                AND quantity > 0
            ) nft_holders_new
          GROUP BY
            nft_holders_new.contract
          ORDER BY
            SUM(nft_holders_new.quantity) DESC
        ) nft_holders_new
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
            nft_meta.contract = nft_holders_new.contract
        ) AS meta ON TRUE
    `;

    const [fts, nfts] = await Promise.all([ftQuery, nftQuery]);
    // The 'aurora' contract is a proxy for the ETH bridge on NEAR. Rename it to 'eth.bridge.near'.
    const updatedFts = fts.map((ft) => {
      if (ft.contract === 'aurora') {
        return { ...ft, contract: 'eth.bridge.near' };
      }
      return ft;
    });

    return res.status(200).json({ inventory: { fts: updatedFts, nfts } });
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
