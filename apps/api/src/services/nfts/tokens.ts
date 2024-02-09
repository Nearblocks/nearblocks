import { Response } from 'express';

import catchAsync from '#libs/async';
import db from '#libs/db';
import {
  TokenItem,
  Tokens,
  TokensCount,
  TokenTxns,
  TokenTxnsCount,
} from '#libs/schema/nfts';
import { getPagination, keyBinder } from '#libs/utils';
import { RequestValidator } from '#types/types';

const list = catchAsync(
  async (req: RequestValidator<Tokens>, res: Response) => {
    const contract = req.validator.data.contract;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;

    const { limit, offset } = getPagination(page, per_page);
    const { query, values } = keyBinder(
      `
        SELECT
          tm.contract,
          tm.token,
          tm.title,
          tm.description,
          tm.media,
          tm.copies,
          tm.extra,
          tm.reference,
          json_build_object(
            'owner',
            nft.affected_account_id
          ) AS asset
        FROM
          nft_token_meta tm
          INNER JOIN (
            SELECT
              contract,
              token
            FROM
              nft_token_meta
            WHERE
              contract = :contract
            LIMIT
              :limit OFFSET :offset
          ) AS tmp using(contract, token)
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
      `,
      { contract, limit, offset },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ tokens: rows });
  },
);

const count = catchAsync(
  async (req: RequestValidator<TokensCount>, res: Response) => {
    const contract = req.validator.data.contract;

    const { query, values } = keyBinder(
      `
        SELECT
          COUNT(contract)
        FROM
          nft_token_meta
        WHERE
          contract = :contract
      `,
      { contract },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ tokens: rows });
  },
);

const item = catchAsync(
  async (req: RequestValidator<TokenItem>, res: Response) => {
    const contract = req.validator.data.contract;
    const token = req.validator.data.token;

    const { query, values } = keyBinder(
      `
        SELECT
          tm.contract,
          tm.token,
          tm.title,
          tm.description,
          tm.media,
          tm.copies,
          tm.extra,
          tm.reference,
          json_build_object(
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
          json_build_object(
            'owner',
            nft.affected_account_id
          ) AS asset
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
          tm.contract = :contract
          AND tm.token = :token
      `,
      { contract, token },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ tokens: rows });
  },
);

const txns = catchAsync(
  async (req: RequestValidator<TokenTxns>, res: Response) => {
    const contract = req.validator.data.contract;
    const token = req.validator.data.token;
    const event = req.validator.data.event;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;

    const { limit, offset } = getPagination(page, per_page);
    const { query, values } = keyBinder(
      `
        SELECT
          event_index,
          affected_account_id,
          involved_account_id,
          token_id,
          cause,
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
              contract_account_id = :contract
              AND token_id = :token
              AND ${event ? `cause = :event` : true}
              AND EXISTS (
                SELECT
                  1
                FROM
                  nft_meta nft
                WHERE
                  nft.contract = a.contract_account_id
              )
            ORDER BY
              event_index ${order === 'desc' ? 'DESC' : 'ASC'}
            LIMIT
              :limit OFFSET :offset
          ) AS tmp using(
            event_index
          )
          INNER JOIN LATERAL (
            SELECT
              transactions.transaction_hash,
              transactions.included_in_block_hash,
              transactions.block_timestamp,
              (
                SELECT
                  json_build_object(
                    'block_height',
                    block_height
                  )
                FROM
                  blocks
                WHERE
                  blocks.block_hash = transactions.included_in_block_hash
              ) AS block,
              (
                SELECT
                  json_build_object(
                    'status',
                    BOOL_AND (
                      CASE WHEN status = 'SUCCESS_RECEIPT_ID'
                      OR status = 'SUCCESS_VALUE' THEN TRUE ELSE FALSE END
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
          event_index ${order === 'desc' ? 'DESC' : 'ASC'}
      `,
      { contract, event, limit, offset, token },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ txns: rows });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<TokenTxnsCount>, res: Response) => {
    const contract = req.validator.data.contract;
    const token = req.validator.data.token;
    const event = req.validator.data.event;

    const { query, values } = keyBinder(
      `
        SELECT
          COUNT(*)
        FROM
          nft_events a
        WHERE
          contract_account_id = :contract
          AND token_id = :token
          AND ${event ? `cause = :event` : true}
          AND EXISTS (
            SELECT
              1
            FROM
              nft_meta nft
            WHERE
              nft.contract = a.contract_account_id
          )
      `,
      { contract, event, token },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ txns: rows });
  },
);

export default { count, item, list, txns, txnsCount };
