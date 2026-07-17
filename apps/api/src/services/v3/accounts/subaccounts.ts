import { stringify } from 'csv-stringify';
import { NextFunction, Response } from 'express';

import type {
  AccountSubAccount,
  AccountSubAccountCount,
  AccountSubAccountCountReq,
  AccountSubAccountExportReq,
  AccountSubAccountsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/subaccounts/request.js';
import response from 'nb-schemas/dist/accounts/subaccounts/response.js';

import catchAsync from '#libs/async';
import cursors from '#libs/cursors';
import dayjs from '#libs/dayjs';
import { dbBase } from '#libs/pgp';
import { paginateData } from '#libs/response';
import { msToNsTime, nsToMsTime } from '#libs/utils';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import { blockRange as blockRangeSql } from '#sql/accounts';
import sql from '#sql/accounts';

const subaccounts = responseHandler(
  response.subaccounts,
  async (req: RequestValidator<AccountSubAccountsReq>) => {
    const account = req.validator.account;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const subaccounts = await dbBase.manyOrNone<AccountSubAccount>(
      sql.subaccounts.subaccounts,
      {
        account,
        cursor: {
          key: cursor?.key,
          timestamp: cursor?.timestamp,
        },
        direction,
        // Fetch one extra to check if there is a next page
        limit: limit + 1,
      },
    );

    return paginateData(
      subaccounts,
      limit,
      direction,
      (subaccount) => ({
        key: subaccount.account_id,
        timestamp: subaccount.action_timestamp,
      }),
      !!cursor,
    );
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<AccountSubAccountCountReq>) => {
    const account = req.validator.account;

    const count = await dbBase.one<AccountSubAccountCount>(
      sql.subaccounts.count,
      {
        account,
      },
    );

    return { data: count };
  },
);

const exports = catchAsync(
  async (
    req: RequestValidator<AccountSubAccountExportReq>,
    res: Response,
    next: NextFunction,
  ) => {
    const { account } = req.validator;
    let start: string;
    let end: string;

    if (req.validator.filter === 'date') {
      start = msToNsTime(
        dayjs(req.validator.start, 'YYYY-MM-DD', true).startOf('day').valueOf(),
      );
      end = msToNsTime(
        dayjs(req.validator.end, 'YYYY-MM-DD', true).endOf('day').valueOf(),
      );
    } else {
      const range = await dbBase.oneOrNone(blockRangeSql, {
        block_end: req.validator.block_end,
        block_start: req.validator.block_start,
      });

      if (!range?.start_ts) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=subaccounts.csv',
        );
        res.end();
        return;
      }

      start = range.start_ts;
      end = range.end_ts;
    }

    const rows = await dbBase.manyOrNone(sql.subaccounts.export, {
      account,
      end,
      start,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=subaccounts.csv',
    );

    const stringifier = stringify({
      columns: [
        { header: 'Account', key: 'account' },
        { header: 'Created Txn', key: 'createdTxn' },
        { header: 'Created Time', key: 'createdTime' },
        { header: 'Deleted Txn', key: 'deletedTxn' },
        { header: 'Deleted Time', key: 'deletedTime' },
      ],
      header: true,
    });

    stringifier.on('error', (error) => {
      next(error);
    });

    stringifier.pipe(res);

    rows.forEach((row) => {
      stringifier.write({
        account: row.account_id,
        createdTime: row.created?.block?.block_timestamp
          ? dayjs(+nsToMsTime(row.created.block.block_timestamp)).format(
              'YYYY-MM-DD HH:mm:ss',
            )
          : '',
        createdTxn: row.created?.transaction_hash ?? '',
        deletedTime: row.deleted?.block?.block_timestamp
          ? dayjs(+nsToMsTime(row.deleted.block.block_timestamp)).format(
              'YYYY-MM-DD HH:mm:ss',
            )
          : '',
        deletedTxn: row.deleted?.transaction_hash ?? '',
      });
    });

    stringifier.end();
  },
);

export default { count, exports, subaccounts };
