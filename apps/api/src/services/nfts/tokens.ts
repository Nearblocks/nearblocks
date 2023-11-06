import { Response } from 'express';

import db from '#libs/db';
import catchAsync from '#libs/async';
import { RequestValidator } from '#ts/types';
import { keyBinder, getPagination } from '#libs/utils';
import {
  Tokens,
  TokenItem,
  TokenTxns,
  TokensCount,
  TokenTxnsCount,
} from '#libs/schema/nfts';

const list = catchAsync(
  async (req: RequestValidator<Tokens>, res: Response) => {
    const contract = req.validator.data.contract;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;

    const { limit, offset } = getPagination(page, per_page);
    const { query, values } = keyBinder(
      `
        SELECT
          ntm.contract,
          ntm.token,
          ntm.title,
          ntm.description,
          ntm.media,
          ntm.copies,
          ntm.extra,
          ntm.reference,
          json_build_object(
            'owner',
            nft.token_new_owner_account_id
          ) AS asset
        FROM
          nft_token_meta ntm
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
              token_new_owner_account_id
            FROM
              assets__non_fungible_token_events
            WHERE
              emitted_by_contract_account_id = ntm.contract
              AND token_id = ntm.token
            ORDER BY
              emitted_at_block_timestamp DESC,
              emitted_in_shard_id DESC,
              emitted_index_of_event_entry_in_shard DESC
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
          ntm.contract,
          ntm.token,
          ntm.title,
          ntm.description,
          ntm.media,
          ntm.copies,
          ntm.extra,
          ntm.reference,
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
            nft.token_new_owner_account_id
          ) AS asset
        FROM
          nft_token_meta ntm
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
              contract = ntm.contract
          ) meta ON TRUE
          INNER JOIN LATERAL (
            SELECT
              token_new_owner_account_id
            FROM
              assets__non_fungible_token_events
            WHERE
              emitted_by_contract_account_id = ntm.contract
              AND token_id = ntm.token
            ORDER BY
              emitted_at_block_timestamp DESC,
              emitted_in_shard_id DESC,
              emitted_index_of_event_entry_in_shard DESC
            LIMIT
              1
          ) nft ON TRUE
        WHERE
          ntm.contract = :contract
          AND ntm.token = :token
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
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const event = req.validator.data.event;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;

    const { limit, offset } = getPagination(page, per_page);
    // Use the same inner join query for txn count query below
    const { query, values } = keyBinder(
      `
        SELECT
          concat_ws(
            '-',
            emitted_for_receipt_id,
            emitted_at_block_timestamp,
            emitted_in_shard_id,
            emitted_for_event_type,
            emitted_index_of_event_entry_in_shard
          ) as key,
          token_old_owner_account_id,
          token_new_owner_account_id,
          token_id,
          event_kind,
          txn.transaction_hash,
          txn.included_in_block_hash,
          txn.block_timestamp,
          txn.block,
          txn.outcomes
        FROM
          assets__non_fungible_token_events
          INNER JOIN (
            SELECT
              emitted_for_receipt_id,
              emitted_at_block_timestamp,
              emitted_in_shard_id,
              emitted_for_event_type,
              emitted_index_of_event_entry_in_shard
            FROM
              assets__non_fungible_token_events a
            WHERE
              emitted_by_contract_account_id = :contract
              AND token_id = :token
              AND ${from ? `token_old_owner_account_id = :from` : true}
              AND ${to ? `token_new_owner_account_id = :to` : true}
              AND ${event ? `event_kind = :event` : true}
              AND EXISTS (
                SELECT
                  1
                FROM
                  nft_meta nft
                WHERE
                  nft.contract = a.emitted_by_contract_account_id
              )
            ORDER BY
              emitted_at_block_timestamp ${order === 'desc' ? 'DESC' : 'ASC'},
              emitted_in_shard_id ${order === 'desc' ? 'DESC' : 'ASC'},
              emitted_index_of_event_entry_in_shard ${
                order === 'desc' ? 'DESC' : 'ASC'
              }
            LIMIT
              :limit OFFSET :offset
          ) AS tmp using(
            emitted_for_receipt_id,
            emitted_at_block_timestamp,
            emitted_in_shard_id,
            emitted_for_event_type,
            emitted_index_of_event_entry_in_shard
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
              receipts.receipt_id = assets__non_fungible_token_events.emitted_for_receipt_id
          ) txn ON TRUE
        ORDER BY
          emitted_at_block_timestamp ${order === 'desc' ? 'DESC' : 'ASC'},
          emitted_in_shard_id ${order === 'desc' ? 'DESC' : 'ASC'},
          emitted_index_of_event_entry_in_shard ${
            order === 'desc' ? 'DESC' : 'ASC'
          }
      `,
      { contract, token, from, to, limit, offset, event },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ txns: rows });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<TokenTxnsCount>, res: Response) => {
    const contract = req.validator.data.contract;
    const token = req.validator.data.token;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const event = req.validator.data.event;

    const { query, values } = keyBinder(
      `
        SELECT
          COUNT(*)
        FROM
          assets__non_fungible_token_events a
        WHERE
          emitted_by_contract_account_id = :contract
          AND token_id = :token
          AND ${from ? `token_old_owner_account_id = :from` : true}
          AND ${to ? `token_new_owner_account_id = :to` : true}
          AND ${event ? `event_kind = :event` : true}
          AND EXISTS (
            SELECT
              1
            FROM
              nft_meta nft
            WHERE
              nft.contract = a.emitted_by_contract_account_id
          )
      `,
      { contract, token, from, to, event },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ txns: rows });
  },
);

export default { list, count, item, txns, txnsCount };
