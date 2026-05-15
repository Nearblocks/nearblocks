import { stringify } from 'csv-stringify';
import { NextFunction, Response } from 'express';

import type {
  AccountReceipt,
  AccountReceiptCountReq,
  AccountReceiptExportReq,
  AccountReceiptsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/receipts/request.js';
import response from 'nb-schemas/dist/accounts/receipts/response.js';

import config from '#config';
import catchAsync from '#libs/async';
import cursors from '#libs/cursors';
import dayjs from '#libs/dayjs';
import { dbBase, pgp } from '#libs/pgp';
import {
  cappedCount,
  countFromCagg,
  paginateData,
  rollingWindowCount,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
  windowStart,
} from '#libs/response';
import { msToNsTime, nsToMsTime, yoctoToNear } from '#libs/utils';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import { blockRange as blockRangeSql } from '#sql/accounts';
import sql from '#sql/accounts';
import { ActionKind } from '#types/enums';

const receipts = responseHandler(
  response.receipts,
  async (req: RequestValidator<AccountReceiptsReq>) => {
    const account = req.validator.account;
    const predecessor = req.validator.predecessor;
    const receiver = req.validator.receiver;
    const limit = req.validator.limit;
    const before = req.validator.before_ts;
    const action = req.validator.action;
    const method = req.validator.method;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    if (
      predecessor &&
      receiver &&
      predecessor !== account &&
      receiver !== account
    ) {
      return { data: [] };
    }

    const receiptsQuery: WindowListQuery<AccountReceipt> = (
      start,
      end,
      limit,
    ) => {
      const cte = pgp.as.format(
        predecessor || receiver ? sql.receipts.cte : sql.receipts.cteUnion,
        {
          action,
          before,
          cursor: {
            index: cursor?.index,
            shard: cursor?.shard,
            timestamp: cursor?.timestamp,
          },
          direction,
          end,
          limit,
          method,
          predecessor: predecessor || account,
          receiver: receiver || account,
          start,
        },
      );

      return dbBase.manyOrNone<AccountReceipt>(sql.receipts.receipts, {
        cte,
        direction,
      });
    };

    const receipts = await rollingWindowList(receiptsQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: windowStart(config.baseStart, cursor?.timestamp, direction),
    });

    return paginateData(
      receipts,
      limit,
      direction,
      (receipt) => ({
        index: receipt.index_in_chunk,
        shard: receipt.shard_id,
        timestamp: receipt.included_in_block_timestamp,
      }),
      !!cursor,
    );
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<AccountReceiptCountReq>) => {
    const account = req.validator.account;
    const predecessor = req.validator.predecessor;
    const receiver = req.validator.receiver;
    const before = req.validator.before_ts;
    const action = req.validator.action;
    const method = req.validator.method;

    if (
      predecessor &&
      receiver &&
      predecessor !== account &&
      receiver !== account
    ) {
      return { data: { count: '0' } };
    }

    if (!predecessor && !receiver && !action && !method && !before) {
      const result = await dbBase.one<{ count: string }>(
        sql.receipts.countCagg,
        { account },
      );
      const count = await countFromCagg(
        result.count,
        config.maxQueryCount,
        () =>
          rollingWindowCount(
            (start, end, limit) =>
              dbBase.one<{ count: string }>(sql.receipts.countUnion, {
                action,
                before,
                end,
                limit,
                method,
                predecessor: account,
                receiver: account,
                start,
              }),
            { limit: config.maxQueryCount, start: config.baseStart },
          ),
      );

      return { data: { count } };
    }

    const countSql =
      predecessor || receiver ? sql.receipts.count : sql.receipts.countUnion;
    const beforeTs = before ? BigInt(before) - 1n : undefined;
    const count = await rollingWindowCount(
      (start, end, limit) =>
        dbBase.one<{ count: string }>(countSql, {
          action,
          before,
          end,
          limit,
          method,
          predecessor: predecessor || account,
          receiver: receiver || account,
          start,
        }),
      { end: beforeTs, limit: config.maxQueryCount, start: config.baseStart },
    );

    return { data: { count: cappedCount(count, config.maxQueryCount) } };
  },
);

const exports = catchAsync(
  async (
    req: RequestValidator<AccountReceiptExportReq>,
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
          'attachment; filename=receipts.csv',
        );
        res.end();
        return;
      }

      start = range.start_ts;
      end = range.end_ts;
    }

    const cte = pgp.as.format(sql.receipts.exportCte, { account, end, start });
    const rows = await dbBase.manyOrNone(sql.receipts.receipts, {
      cte,
      direction: 'asc',
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=receipts.csv');

    const stringifier = stringify({
      columns: [
        { header: 'Status', key: 'status' },
        { header: 'Receipt', key: 'receipt' },
        { header: 'Txn Hash', key: 'hash' },
        { header: 'Method', key: 'method' },
        { header: 'Deposit Value', key: 'deposit' },
        { header: 'From', key: 'from' },
        { header: 'To', key: 'to' },
        { header: 'Block', key: 'block' },
        { header: 'Time', key: 'timestamp' },
      ],
      header: true,
    });

    stringifier.on('error', (error) => {
      next(error);
    });

    stringifier.pipe(res);

    rows.forEach((row) => {
      const status = row.outcome?.status;
      const action = row.actions?.[0]?.action;
      const method = row.actions?.[0]?.method ?? 'Unknown';

      stringifier.write({
        block: row.block?.block_height,
        deposit: yoctoToNear(row.actions_agg?.deposit ?? '0'),
        from: row.predecessor_account_id || 'system',
        hash: row.transaction_hash,
        method:
          !action || action === ActionKind.FUNCTION_CALL ? method : action,
        receipt: row.receipt_id,
        status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
        timestamp: dayjs(+nsToMsTime(row.included_in_block_timestamp)).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        to: row.receiver_account_id || 'system',
      });
    });

    stringifier.end();
  },
);

export default { count, exports, receipts };
