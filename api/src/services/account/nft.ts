import { Response } from 'express';

import db from '#libs/db';
import config from '#config';
import dayjs from '#libs/dayjs';
import catchAsync from '#libs/async';
import { streamCsv } from '#libs/stream';
import { RequestValidator, StreamTransformWrapper } from '#ts/types';
import { NftTxns, NftTxnsCount, NftTxnsExport } from '#libs/schema/account';
import { keyBinder, getPagination, msToNsTime, nsToMsTime } from '#libs/utils';

const txns = catchAsync(
  async (req: RequestValidator<NftTxns>, res: Response) => {
    const account = req.validator.data.account;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const event = req.validator.data.event;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const order = req.validator.data.order;

    if (from && to && from !== account && to !== account) {
      return res.status(200).json({ txns: [] });
    }

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
          event_kind,
          token_id,
          txn.transaction_hash,
          txn.included_in_block_hash,
          txn.block_timestamp,
          txn.block,
          txn.outcomes,
          (
            SELECT
              json_build_object(
                'contract',
                contract,
                'name',
                name,
                'symbol',
                symbol,
                'icon',
                icon,
                'base_uri',
                base_uri,
                'reference',
                reference
              )
            FROM
              nft_meta
            WHERE
              nft_meta.contract = emitted_by_contract_account_id
          ) AS nft
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
              ${
                from || to
                  ? `
                    token_old_owner_account_id = ${from ? `:from` : `:account`}
                    AND token_new_owner_account_id = ${to ? `:to` : `:account`}
                  `
                  : `
                    (
                      token_old_owner_account_id = :account
                      OR token_new_owner_account_id = :account
                    )
                  `
              }
              AND ${event ? `event_kind = :event` : true}
              AND EXISTS (
                SELECT
                  1
                FROM
                  nft_token_meta nft
                WHERE
                  nft.contract = a.emitted_by_contract_account_id
                  AND nft.token = a.token_id
              )
            ORDER BY
              emitted_at_block_timestamp + 0 ${
                order === 'desc' ? 'DESC' : 'ASC'
              },
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
          LEFT JOIN LATERAL (
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
      { account, from, to, limit, offset, event },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ txns: rows });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<NftTxnsCount>, res: Response) => {
    const account = req.validator.data.account;
    const from = req.validator.data.from;
    const to = req.validator.data.to;
    const event = req.validator.data.event;

    if (from && to && from !== account && to !== account) {
      return res.status(200).json({ txns: [] });
    }

    const useFormat = true;
    const bindings = { account, from, to, event };
    const rawQuery = (options: any) => `
      SELECT
        ${options.select}
      FROM
        assets__non_fungible_token_events a
      WHERE
        ${
          from || to
            ? `
              token_old_owner_account_id = ${from ? `:from` : `:account`}
              AND token_new_owner_account_id = ${to ? `:to` : `:account`}
            `
            : `
              (
                token_old_owner_account_id = :account
                OR token_new_owner_account_id = :account
              )
            `
        }
        AND ${event ? `event_kind = :event` : true}
        AND EXISTS (
          SELECT
            1
          FROM
            nft_token_meta nft
          WHERE
            nft.contract = a.emitted_by_contract_account_id
            AND nft.token = a.token_id
        )
    `;
    const { query, values } = keyBinder(
      rawQuery({ select: 'emitted_for_receipt_id' }),
      bindings,
      useFormat,
    );

    const { rows } = await db.query(
      `SELECT cost, rows as count FROM count_cost_estimate(${query})`,
      values,
    );

    const cost = +rows?.[0]?.cost;
    const count = +rows?.[0]?.count;

    if (cost > config.maxQueryCost && count > config.maxQueryRows) {
      return res.status(200).json({ txns: rows });
    }

    const { query: countQuery, values: countValues } = keyBinder(
      rawQuery({ select: 'COUNT(emitted_for_receipt_id)' }),
      bindings,
    );

    const { rows: countRows } = await db.query(countQuery, countValues);

    return res.status(200).json({ txns: countRows });
  },
);

const txnsExport = catchAsync(
  async (req: RequestValidator<NftTxnsExport>, res: Response) => {
    const account = req.validator.data.account;
    const start = msToNsTime(
      dayjs(req.validator.data.start, 'YYYY-MM-DD', true)
        .startOf('day')
        .valueOf(),
    );
    const end = msToNsTime(
      dayjs(req.validator.data.end, 'YYYY-MM-DD', true)
        .startOf('day')
        .valueOf(),
    );

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
          event_kind,
          token_id,
          txn.transaction_hash,
          txn.included_in_block_hash,
          txn.block_timestamp,
          txn.block,
          txn.outcomes,
          (
            SELECT
              json_build_object(
                'contract',
                contract,
                'name',
                name,
                'symbol',
                symbol,
                'icon',
                icon,
                'base_uri',
                base_uri,
                'reference',
                reference
              )
            FROM
              nft_meta
            WHERE
              nft_meta.contract = emitted_by_contract_account_id
          ) AS nft
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
              JOIN receipts r ON r.receipt_id = a.emitted_for_receipt_id
              JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
            WHERE
              (
                token_old_owner_account_id = :account
                OR token_new_owner_account_id = :account
              )
              AND EXISTS (
                SELECT
                  1
                FROM
                  nft_token_meta nft
                WHERE
                  nft.contract = a.emitted_by_contract_account_id
                  AND nft.token = a.token_id
              )
              AND t.block_timestamp BETWEEN :start AND :end
            ORDER BY
              emitted_at_block_timestamp ASC,
              emitted_in_shard_id ASC,
              emitted_index_of_event_entry_in_shard ASC
            LIMIT
              5000
          ) AS tmp using(
            emitted_for_receipt_id,
            emitted_at_block_timestamp,
            emitted_in_shard_id,
            emitted_for_event_type,
            emitted_index_of_event_entry_in_shard
          )
          LEFT JOIN LATERAL (
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
          emitted_at_block_timestamp ASC,
          emitted_in_shard_id ASC,
          emitted_index_of_event_entry_in_shard ASC
      `,
      { account, start, end },
    );

    const columns = [
      { key: 'status', header: 'Status' },
      { key: 'hash', header: 'Txn Hash' },
      { key: 'method', header: 'Method' },
      { key: 'from', header: 'From' },
      { key: 'to', header: 'To' },
      { key: 'id', header: 'Token ID' },
      { key: 'token', header: 'Token' },
      { key: 'contract', header: 'Contract' },
      { key: 'block', header: 'Block' },
      { key: 'timestamp', header: 'Time' },
    ];
    const transform: StreamTransformWrapper =
      (stringifier) => (row, _, callback) => {
        const status = row.outcomes.status;

        stringifier.write({
          status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
          hash: row.transaction_hash,
          method: row.event_kind,
          from: row.token_old_owner_account_id || 'system',
          to: row.token_new_owner_account_id || 'system',
          id: row.token_id,
          token: row.nft ? `${row.nft.name} (${row.nft.symbol})` : '',
          contract: row.nft ? row.nft.contract : '',
          block: row.block.block_height,
          timestamp: dayjs(+nsToMsTime(row.block_timestamp)).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
        });
        callback();
      };

    streamCsv(res, query, values, columns, transform);
  },
);

export default { txns, txnsCount, txnsExport };
