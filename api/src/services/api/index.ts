import { Response } from 'express';

import db from '#libs/db';
import catchAsync from '#libs/async';
import { RequestValidator } from '#ts/types';
import { AccountTxns } from '#libs/schema/api/index';
import { keyBinder, getPagination, yoctoToNear } from '#libs/utils';

const accountTxns = catchAsync(
  async (req: RequestValidator<AccountTxns>, res: Response) => {
    const account = req.validator.data.account;
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;

    const { limit, offset } = getPagination(page, per_page);
    const { query, values } = keyBinder(
      `
        SELECT
          transactions.transaction_hash,
          transactions.included_in_block_hash,
          transactions.block_timestamp,
          transactions.signer_account_id,
          transactions.receiver_account_id,
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
              json_agg(
                json_build_object(
                  'action',
                  action_receipt_actions.action_kind,
                  'method',
                  action_receipt_actions.args ->> 'method_name'
                )
              )
            FROM
              action_receipt_actions
              JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
            WHERE
              receipts.receipt_id = transactions.converted_into_receipt_id
          ) AS actions,
          (
            SELECT
              json_build_object(
                'deposit',
                COALESCE(SUM((args ->> 'deposit') :: NUMERIC), 0)
              )
            FROM
              action_receipt_actions
              JOIN receipts ON receipts.receipt_id = action_receipt_actions.receipt_id
            WHERE
              receipts.receipt_id = transactions.converted_into_receipt_id
          ) AS actions_agg,
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
          ) AS outcomes,
          (
            SELECT
              json_build_object(
                'transaction_fee',
                COALESCE(receipt_conversion_tokens_burnt, 0) + COALESCE(SUM(tokens_burnt), 0)
              )
            FROM
              execution_outcomes
              JOIN receipts ON receipts.receipt_id = execution_outcomes.receipt_id
            WHERE
              receipts.originated_from_transaction_hash = transactions.transaction_hash
          ) AS outcomes_agg
        FROM
          transactions
          INNER JOIN (
            SELECT
              transaction_hash
            FROM
              transactions
            WHERE
              EXISTS (
                SELECT
                  1
                FROM
                  receipts
                WHERE
                  receipts.originated_from_transaction_hash = transactions.transaction_hash
                  AND (
                    receipts.predecessor_account_id = :account
                    OR receipts.receiver_account_id = :account
                  )
              )
            ORDER BY
              transactions.block_timestamp DESC,
              transactions.index_in_chunk DESC
            LIMIT
              :limit OFFSET :offset
          ) AS tmp USING (transaction_hash)
      `,
      { account, limit, offset },
    );

    const { rows } = await db.query(query, values);

    const txns = rows.map((row) => {
      const status = row.outcomes.status;

      return {
        hash: row.transaction_hash,
        action: row.actions?.[0]?.action ?? null,
        method: row.actions?.[0]?.method ?? null,
        block: row.block.block_height,
        timestamp: row.block_timestamp,
        from: row.signer_account_id,
        to: row.receiver_account_id,
        deposit: yoctoToNear(row.actions_agg.deposit),
        fee: yoctoToNear(row.outcomes_agg.transaction_fee),
        status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
      };
    });

    return res.status(200).json({ txns });
  },
);

export default { accountTxns };
