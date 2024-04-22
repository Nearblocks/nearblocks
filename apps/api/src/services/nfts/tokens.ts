import { Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import {
  TokenItem,
  Tokens,
  TokensCount,
  TokenTxns,
  TokenTxnsCount,
} from '#libs/schema/nfts';
import { getPagination } from '#libs/utils';
import { RequestValidator } from '#types/types';

const list = catchAsync(
  async (req: RequestValidator<Tokens>, res: Response) => {
    const contract = req.validator.data.contract;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;

    const { limit, offset } = getPagination(page, per_page);
    const tokens = await sql`
      SELECT
        tm.contract,
        tm.token,
        tm.title,
        tm.description,
        tm.media,
        tm.copies,
        tm.extra,
        tm.reference,
        JSON_BUILD_OBJECT('owner', nft.affected_account_id) AS asset
      FROM
        nft_token_meta tm
        INNER JOIN (
          SELECT
            contract,
            token
          FROM
            nft_token_meta
          WHERE
            contract = ${contract}
          LIMIT
            ${limit}
          OFFSET
            ${offset}
        ) AS tmp using (contract, token)
        INNER JOIN LATERAL (
          SELECT
            affected_account_id
          FROM
            nft_events
          WHERE
            contract_account_id = tm.contract
            AND token_id = tm.token
            AND delta_amount = 1
          ORDER BY
            event_index DESC
          LIMIT
            1
        ) nft ON TRUE
    `;

    return res.status(200).json({ tokens });
  },
);

const count = catchAsync(
  async (req: RequestValidator<TokensCount>, res: Response) => {
    const contract = req.validator.data.contract;

    const tokens = await sql`
      SELECT
        COUNT(contract)
      FROM
        nft_token_meta
      WHERE
        contract = ${contract}
    `;

    return res.status(200).json({ tokens });
  },
);

const item = catchAsync(
  async (req: RequestValidator<TokenItem>, res: Response) => {
    const contract = req.validator.data.contract;
    const token = req.validator.data.token;

    const tokens = await sql`
      SELECT
        tm.contract,
        tm.token,
        tm.title,
        tm.description,
        tm.media,
        tm.copies,
        tm.extra,
        tm.reference,
        tm.reference_hash,
        JSON_BUILD_OBJECT(
          'contract',
          meta.contract,
          'name',
          meta.name,
          'symbol',
          meta.symbol,
          'icon',
          meta.icon,
          'base_uri',
          meta.base_uri,
          'reference',
          meta.reference
        ) AS nft,
        JSON_BUILD_OBJECT('owner', nft.affected_account_id) AS asset
      FROM
        nft_token_meta tm
        INNER JOIN LATERAL (
          SELECT
            contract,
            name,
            symbol,
            icon,
            base_uri,
            reference
          FROM
            nft_meta
          WHERE
            contract = tm.contract
        ) meta ON TRUE
        INNER JOIN LATERAL (
          SELECT
            affected_account_id
          FROM
            nft_events
          WHERE
            contract_account_id = tm.contract
            AND token_id = tm.token
            AND delta_amount = 1
          ORDER BY
            event_index DESC
          LIMIT
            1
        ) nft ON TRUE
      WHERE
        tm.contract = ${contract}
        AND tm.token = ${token}
    `;

    return res.status(200).json({ tokens });
  },
);

const txns = catchAsync(
  async (req: RequestValidator<TokenTxns>, res: Response) => {
    const contract = req.validator.data.contract;
    const token = req.validator.data.token;
    const event = req.validator.data.event;
    const cursor = req.validator.data.cursor?.replace('n', '');
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;

    const { limit, offset } = getPagination(page, per_page);
    const txns = await sql`
      SELECT
        event_index,
        affected_account_id,
        involved_account_id,
        token_id,
        cause,
        delta_amount,
        txn.transaction_hash,
        txn.included_in_block_hash,
        txn.block_timestamp,
        txn.block,
        txn.outcomes
      FROM
        nft_events
        INNER JOIN (
          SELECT
            event_index
          FROM
            nft_events a
          WHERE
            contract_account_id = ${contract}
            AND token_id = ${token}
            AND ${event ? sql`cause = ${event}` : true}
            AND ${cursor
        ? sql`event_index ${order === 'desc' ? sql`<` : sql`>`} ${cursor}`
        : true}
            AND EXISTS (
              SELECT
                1
              FROM
                nft_meta nft
              WHERE
                nft.contract = a.contract_account_id
            )
            AND EXISTS (
              SELECT
                1
              FROM
                transactions
                JOIN receipts ON receipts.originated_from_transaction_hash = transactions.transaction_hash
              WHERE
                receipts.receipt_id = a.receipt_id
            )
          ORDER BY
            event_index ${order === 'desc' ? sql`DESC` : sql`ASC`}
          LIMIT
            ${limit}
          OFFSET
            ${cursor ? 0 : offset}
        ) AS tmp using (event_index)
        INNER JOIN LATERAL (
          SELECT
            transactions.transaction_hash,
            transactions.included_in_block_hash,
            transactions.block_timestamp,
            (
              SELECT
                JSON_BUILD_OBJECT('block_height', block_height)
              FROM
                blocks
              WHERE
                blocks.block_hash = transactions.included_in_block_hash
            ) AS block,
            (
              SELECT
                JSON_BUILD_OBJECT(
                  'status',
                  BOOL_AND(
                    CASE
                      WHEN status = 'SUCCESS_RECEIPT_ID'
                      OR status = 'SUCCESS_VALUE' THEN TRUE
                      ELSE FALSE
                    END
                  )
                )
              FROM
                execution_outcomes
              WHERE
                execution_outcomes.receipt_id = transactions.converted_into_receipt_id
            ) AS outcomes
          FROM
            transactions
            JOIN receipts ON receipts.originated_from_transaction_hash = transactions.transaction_hash
          WHERE
            receipts.receipt_id = nft_events.receipt_id
        ) txn ON TRUE
      ORDER BY
        event_index ${order === 'desc' ? sql`DESC` : sql`ASC`}
    `;

    let nextCursor = txns?.[txns?.length - 1]?.event_index;
    nextCursor = nextCursor ? `${nextCursor}n` : undefined;

    return res.status(200).json({ cursor: nextCursor, txns });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<TokenTxnsCount>, res: Response) => {
    const contract = req.validator.data.contract;
    const token = req.validator.data.token;
    const event = req.validator.data.event;

    const txns = await sql`
      SELECT
        COUNT(*)
      FROM
        nft_events a
      WHERE
        contract_account_id = ${contract}
        AND token_id = ${token}
        AND ${event ? sql`cause = ${event}` : true}
        AND EXISTS (
          SELECT
            1
          FROM
            nft_meta nft
          WHERE
            nft.contract = a.contract_account_id
        )
        AND EXISTS (
          SELECT
            1
          FROM
            transactions
            JOIN receipts ON receipts.originated_from_transaction_hash = transactions.transaction_hash
          WHERE
            receipts.receipt_id = a.receipt_id
        )
    `;

    return res.status(200).json({ txns });
  },
);

export default { count, item, list, txns, txnsCount };
