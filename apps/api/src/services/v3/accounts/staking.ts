import { stringify } from 'csv-stringify';
import { unionWith } from 'es-toolkit';
import { NextFunction, Response } from 'express';

import type {
  AccountStakingTxn,
  AccountStakingTxnCount,
  AccountStakingTxnCountReq,
  AccountStakingTxnExportReq,
  AccountStakingTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/staking/request.js';
import response from 'nb-schemas/dist/accounts/staking/response.js';

import config from '#config';
import catchAsync from '#libs/async';
import cursors from '#libs/cursors';
import dayjs from '#libs/dayjs';
import { dbBase, dbStaking, pgp } from '#libs/pgp';
import {
  paginateData,
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

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<AccountStakingTxnsReq>) => {
    const account = req.validator.account;
    const contract = req.validator.contract;
    const type = req.validator.type;
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

    const eventsQuery: WindowListQuery<
      Omit<AccountStakingTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbStaking.manyOrNone<
        Omit<AccountStakingTxn, 'block' | 'transaction_hash'>
      >(sql.staking.txns, {
        account,
        before,
        contract,
        cursor: {
          index: cursor?.index,
          shard: cursor?.shard,
          timestamp: cursor?.timestamp,
        },
        direction,
        end,
        limit,
        start,
        type,
      });
    };

    const events = await rollingWindowList(eventsQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: windowStart(config.baseStart, cursor?.timestamp, direction),
    });

    if (!events.length) {
      return { data: [] };
    }

    const queries = events.map((event) => {
      return pgp.as.format(sql.staking.txn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<AccountStakingTxn>(unionQuery);

    // If lengths don't match, receipts are missing (maybe delayed).
    if (txns.length !== events.length) {
      const merged = unionWith(
        txns,
        events,
        (a, b) =>
          `${a.block_timestamp}${a.shard_id}${a.index_in_chunk}` ===
          `${b.block_timestamp}${b.shard_id}${b.index_in_chunk}`,
      );

      return paginateData(
        merged,
        limit,
        direction,
        (txn) => ({
          index: txn.index_in_chunk,
          shard: txn.shard_id,
          timestamp: txn.block_timestamp,
        }),
        !!cursor,
      );
    }

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
  async (req: RequestValidator<AccountStakingTxnCountReq>) => {
    const account = req.validator.account;
    const contract = req.validator.contract;
    const type = req.validator.type;
    const before = req.validator.before_ts;

    const estimated = await dbStaking.one<AccountStakingTxnCount>(
      sql.staking.estimate,
      {
        account,
        before,
        contract,
        type,
      },
    );

    return { data: estimated };
  },
);

const exports = catchAsync(
  async (
    req: RequestValidator<AccountStakingTxnExportReq>,
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
          'attachment; filename=staking-txns.csv',
        );
        res.end();
        return;
      }

      start = range.start_ts;
      end = range.end_ts;
    }

    const events = await dbStaking.manyOrNone(sql.staking.export, {
      account,
      end,
      start,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=staking-txns.csv',
    );

    const stringifier = stringify({
      columns: [
        { header: 'Status', key: 'status' },
        { header: 'Txn Hash', key: 'hash' },
        { header: 'Account', key: 'account' },
        { header: 'Contract', key: 'contract' },
        { header: 'Type', key: 'type' },
        { header: 'Amount', key: 'amount' },
        { header: 'Block', key: 'block' },
        { header: 'Time', key: 'timestamp' },
      ],
      header: true,
    });

    stringifier.on('error', (error) => {
      next(error);
    });

    stringifier.pipe(res);

    if (events.length > 0) {
      const ids = events.map((e) => e.receipt_id);
      const txnRows = await dbBase.manyOrNone(sql.staking.exportTxn, { ids });
      const txnMap = new Map(txnRows.map((t) => [t.receipt_id, t]));

      events.forEach((event) => {
        const txn = txnMap.get(event.receipt_id);
        const status = txn?.outcomes?.status;

        stringifier.write({
          account: event.account,
          amount: yoctoToNear(event.amount),
          block: txn?.block?.block_height ?? '',
          contract: event.contract,
          hash: txn?.transaction_hash ?? '',
          status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
          timestamp: dayjs(+nsToMsTime(event.block_timestamp)).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
          type: event.type,
        });
      });
    }

    stringifier.end();
  },
);

export default { count, exports, txns };
