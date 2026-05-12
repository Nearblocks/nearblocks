import { stringify } from 'csv-stringify';
import { NextFunction, Response } from 'express';

import type {
  AccountTxn,
  AccountTxnCount,
  AccountTxnCountReq,
  AccountTxnExportReq,
  AccountTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/txns/request.js';
import response from 'nb-schemas/dist/accounts/txns/response.js';

import config from '#config';
import catchAsync from '#libs/async';
import cursors from '#libs/cursors';
import dayjs from '#libs/dayjs';
import { dbBase, pgp } from '#libs/pgp';
import {
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
import sql from '#sql/accounts';
import { ActionKind } from '#types/enums';

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<AccountTxnsReq>) => {
    const account = req.validator.account;
    const signer = req.validator.signer;
    const receiver = req.validator.receiver;
    const limit = req.validator.limit;
    const before = req.validator.before_ts;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    if (signer && receiver && signer !== account && receiver !== account) {
      return { data: [] };
    }

    const txnsQuery: WindowListQuery<AccountTxn> = (start, end, limit) => {
      const cte = pgp.as.format(
        signer || receiver ? sql.txns.cte : sql.txns.cteUnion,
        {
          before,
          cursor: {
            index: cursor?.index,
            shard: cursor?.shard,
            timestamp: cursor?.timestamp,
          },
          direction,
          end,
          limit,
          receiver: receiver || account,
          signer: signer || account,
          start,
        },
      );

      return dbBase.manyOrNone<AccountTxn>(sql.txns.txns, { cte, direction });
    };

    const txns = await rollingWindowList(txnsQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: windowStart(config.baseStart, cursor?.timestamp, direction),
    });

    return paginateData(
      txns,
      limit,
      direction,
      (txn) => ({
        index: txn.index_in_chunk,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
      }),
      !!cursor,
    );
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<AccountTxnCountReq>) => {
    const account = req.validator.account;
    const signer = req.validator.signer;
    const receiver = req.validator.receiver;
    const before = req.validator.before_ts;

    if (signer && receiver && signer !== account && receiver !== account) {
      return { data: { count: 0 } };
    }

    const estimated = await dbBase.one<AccountTxnCount>(sql.txns.estimate, {
      before,
      receiver: receiver || account,
      signer: signer || account,
    });

    if (
      +estimated.count < config.maxQueryRows ||
      +estimated.cost < config.maxQueryCost
    ) {
      const beforeTs = before ? BigInt(before) - 1n : undefined;
      const count = await rollingWindowCount(
        (start, end) =>
          dbBase.one<{ count: string }>(sql.txns.count, {
            before,
            end,
            receiver: receiver || account,
            signer: signer || account,
            start,
          }),
        { end: beforeTs, limit: config.maxQueryRows, start: config.baseStart },
      );

      return { data: { cost: estimated.cost, count: String(count) } };
    }

    return { data: estimated };
  },
);

const exports = catchAsync(
  async (
    req: RequestValidator<AccountTxnExportReq>,
    res: Response,
    next: NextFunction,
  ) => {
    const { account, end: endDate, start: startDate } = req.validator;
    const start = msToNsTime(
      dayjs(startDate, 'YYYY-MM-DD', true).startOf('day').valueOf(),
    );
    const end = msToNsTime(
      dayjs(endDate, 'YYYY-MM-DD', true).startOf('day').valueOf(),
    );

    const cte = pgp.as.format(sql.txns.exportCte, { account, end, start });
    const txns = await dbBase.manyOrNone(sql.txns.txns, {
      cte,
      direction: 'asc',
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=txns.csv');

    const stringifier = stringify({
      columns: [
        { header: 'Status', key: 'status' },
        { header: 'Txn Hash', key: 'hash' },
        { header: 'Method', key: 'method' },
        { header: 'Deposit Value', key: 'deposit' },
        { header: 'Txn Fee', key: 'fee' },
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

    txns.forEach((txn) => {
      const status = txn.outcomes?.status;
      const action = txn.actions?.[0]?.action;
      const method = txn.actions?.[0]?.method ?? 'Unknown';

      stringifier.write({
        block: txn.block?.block_height,
        deposit: yoctoToNear(txn.actions_agg?.deposit ?? '0'),
        fee: yoctoToNear(txn.outcomes_agg?.transaction_fee ?? '0'),
        from: txn.signer_account_id || 'system',
        hash: txn.transaction_hash,
        method:
          !action || action === ActionKind.FUNCTION_CALL ? method : action,
        status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
        timestamp: dayjs(+nsToMsTime(txn.block_timestamp)).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        to: txn.receiver_account_id || 'system',
      });
    });

    stringifier.end();
  },
);

export default { count, exports, txns };
