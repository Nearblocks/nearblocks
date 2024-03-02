import { Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import dayjs from '#libs/dayjs';
import db from '#libs/db';
import { NftTxns, NftTxnsCount, NftTxnsExport } from '#libs/schema/account';
import { streamCsv } from '#libs/stream';
import { getPagination, keyBinder, msToNsTime, nsToMsTime } from '#libs/utils';
import {
  RawQueryParams,
  RequestValidator,
  StreamTransformWrapper,
} from '#types/types';

const txns = catchAsync(
  async (req: RequestValidator<NftTxns>, res: Response) => {
    const account = req.validator.data.account;
    const involved = req.validator.data.involved;
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
          cause,
          delta_amount,
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
              nft_meta.contract = contract_account_id
          ) AS nft
        FROM
          nft_events
          INNER JOIN (
            SELECT
              event_index
            FROM
              nft_events a
            WHERE
              affected_account_id = :account
              AND ${involved ? `involved_account_id = :involved` : true}
              AND ${event ? `cause = :event` : true}
              AND EXISTS (
                SELECT
                  1
                FROM
                  nft_token_meta nft
                WHERE
                  nft.contract = a.contract_account_id
                  AND nft.token = a.token_id
              )
            ORDER BY
              event_index ${order === 'desc' ? 'DESC' : 'ASC'}
            LIMIT
              :limit OFFSET :offset
          ) AS tmp using(
            event_index
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
              receipts.receipt_id = nft_events.receipt_id
          ) txn ON TRUE
        ORDER BY
          event_index ${order === 'desc' ? 'DESC' : 'ASC'}
      `,
      { account, event, involved, limit, offset },
    );

    const { rows } = await db.query(query, values);

    return res.status(200).json({ txns: rows });
  },
);

const txnsCount = catchAsync(
  async (req: RequestValidator<NftTxnsCount>, res: Response) => {
    const account = req.validator.data.account;
    const involved = req.validator.data.involved;
    const event = req.validator.data.event;

    const useFormat = true;
    const bindings = { account, event, involved };
    const rawQuery = (options: RawQueryParams) => `
      SELECT
        ${options.select}
      FROM
        nft_events a
      WHERE
        affected_account_id = :account
        AND ${involved ? `involved_account_id = :involved` : true}
        AND ${event ? `cause = :event` : true}
        AND EXISTS (
          SELECT
            1
          FROM
            nft_token_meta nft
          WHERE
            nft.contract = a.contract_account_id
            AND nft.token = a.token_id
        )
    `;
    const { query, values } = keyBinder(
      rawQuery({ select: 'receipt_id' }),
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
      rawQuery({ select: 'COUNT(receipt_id)' }),
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
          event_index,
          affected_account_id,
          involved_account_id,
          cause,
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
              nft_meta.contract = contract_account_id
          ) AS nft
        FROM
          nft_events
          INNER JOIN (
            SELECT
              event_index
            FROM
              nft_events a
              JOIN receipts r ON r.receipt_id = a.receipt_id
              JOIN transactions t ON t.transaction_hash = r.originated_from_transaction_hash
            WHERE
              affected_account_id = :account
              AND EXISTS (
                SELECT
                  1
                FROM
                  nft_token_meta nft
                WHERE
                  nft.contract = a.contract_account_id
                  AND nft.token = a.token_id
              )
              AND t.block_timestamp BETWEEN :start AND :end
            ORDER BY
              event_index ASC
            LIMIT
              5000
          ) AS tmp using(
            event_index
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
              receipts.receipt_id = nft_events.receipt_id
          ) txn ON TRUE
        ORDER BY
          event_index ASC
      `,
      { account, end, start },
    );

    if (query) {
      const { rows } = await db.query(query, values);

      return res.status(200).json({ txns: rows });
    }

    const columns = [
      { header: 'Status', key: 'status' },
      { header: 'Txn Hash', key: 'hash' },
      { header: 'Method', key: 'method' },
      { header: 'From', key: 'from' },
      { header: 'To', key: 'to' },
      { header: 'Token ID', key: 'id' },
      { header: 'Token', key: 'token' },
      { header: 'Contract', key: 'contract' },
      { header: 'Block', key: 'block' },
      { header: 'Time', key: 'timestamp' },
    ];
    const transform: StreamTransformWrapper =
      (stringifier) => (row, _, callback) => {
        const status = row.outcomes.status;

        stringifier.write({
          block: row.block.block_height,
          contract: row.nft ? row.nft.contract : '',
          from: row.affected_account_id || 'system',
          hash: row.transaction_hash,
          id: row.token_id,
          method: row.cause,
          status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
          timestamp: dayjs(+nsToMsTime(row.block_timestamp)).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
          to: row.involved_account_id || 'system',
          token: row.nft ? `${row.nft.name} (${row.nft.symbol})` : '',
        });
        callback();
      };

    return streamCsv(res, query, values, columns, transform);
  },
);

export default { txns, txnsCount, txnsExport };
