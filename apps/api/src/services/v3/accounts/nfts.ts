import { stringify } from 'csv-stringify';
import { unionWith } from 'es-toolkit';
import { NextFunction, Response } from 'express';

import type {
  AccountNFTTxn,
  AccountNFTTxnCountReq,
  AccountNFTTxnExportReq,
  AccountNFTTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/nfts/request.js';
import response from 'nb-schemas/dist/accounts/nfts/response.js';

import config from '#config';
import catchAsync from '#libs/async';
import cursors from '#libs/cursors';
import dayjs from '#libs/dayjs';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
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
import { msToNsTime, nsToMsTime } from '#libs/utils';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import { blockRange as blockRangeSql } from '#sql/accounts';
import sql from '#sql/accounts';

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<AccountNFTTxnsReq>) => {
    const account = req.validator.account;
    const contract = req.validator.contract;
    const token = req.validator.token;
    const involved = req.validator.involved;
    const cause = req.validator.cause;
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
      Omit<AccountNFTTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<
        Omit<AccountNFTTxn, 'block' | 'transaction_hash'>
      >(sql.nfts.txns, {
        account,
        before,
        cause,
        contract,
        cursor: {
          index: cursor?.index,
          shard: cursor?.shard,
          timestamp: cursor?.timestamp,
        },
        direction,
        end,
        involved,
        limit,
        start,
        token,
      });
    };

    const events = await rollingWindowList(eventsQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: windowStart(config.eventsStart, cursor?.timestamp, direction),
    });

    if (!events.length) {
      return { data: [] };
    }

    const queries = events.map((event) => {
      return pgp.as.format(sql.nfts.txn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<AccountNFTTxn>(unionQuery);

    // If lengths don't match, receipts are missing (maybe delayed).
    if (txns.length !== events.length) {
      const merged = unionWith(
        txns,
        events,
        (a, b) =>
          `${a.block_timestamp}${a.shard_id}${a.event_index}` ===
          `${b.block_timestamp}${b.shard_id}${b.event_index}`,
      );

      return paginateData(
        merged,
        limit,
        direction,
        (txn) => ({
          index: txn.event_index,
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
        index: txn.event_index,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
      }),
      !!cursor,
    );
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<AccountNFTTxnCountReq>) => {
    const account = req.validator.account;
    const contract = req.validator.contract;
    const token = req.validator.token;
    const involved = req.validator.involved;
    const cause = req.validator.cause;
    const before = req.validator.before_ts;

    if (!contract && !token && !involved && !cause && !before) {
      const result = await dbEvents.one<{ count: string }>(sql.nfts.countCagg, {
        account,
      });
      const count = await countFromCagg(
        result.count,
        config.maxQueryCount,
        () =>
          rollingWindowCount(
            (start, end, limit) =>
              dbEvents.one<{ count: string }>(sql.nfts.count, {
                account,
                before,
                cause,
                contract,
                end,
                involved,
                limit,
                start,
                token,
              }),
            {
              limit: config.maxQueryCount,
              start: config.eventsStart,
            },
          ),
      );

      return { data: { count } };
    }

    const beforeTs = before ? BigInt(before) - 1n : undefined;
    const count = await rollingWindowCount(
      (start, end, limit) =>
        dbEvents.one<{ count: string }>(sql.nfts.count, {
          account,
          before,
          cause,
          contract,
          end,
          involved,
          limit,
          start,
          token,
        }),
      {
        end: beforeTs,
        limit: config.maxQueryCount,
        start: config.eventsStart,
      },
    );

    return { data: { count: cappedCount(count, config.maxQueryCount) } };
  },
);

const exports = catchAsync(
  async (
    req: RequestValidator<AccountNFTTxnExportReq>,
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
          'attachment; filename=nft-txns.csv',
        );
        res.end();
        return;
      }

      start = range.start_ts;
      end = range.end_ts;
    }

    const events = await dbEvents.manyOrNone(sql.nfts.export, {
      account,
      end,
      start,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=nft-txns.csv');

    const stringifier = stringify({
      columns: [
        { header: 'Status', key: 'status' },
        { header: 'Txn Hash', key: 'hash' },
        { header: 'Method', key: 'method' },
        { header: 'Affected', key: 'affected' },
        { header: 'Involved', key: 'involved' },
        { header: 'Direction', key: 'direction' },
        { header: 'Token ID', key: 'id' },
        { header: 'Token', key: 'token' },
        { header: 'Contract', key: 'contract' },
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
      const txnRows = await dbBase.manyOrNone(sql.nfts.exportTxn, { ids });
      const txnMap = new Map(txnRows.map((t) => [t.receipt_id, t]));

      events.forEach((event) => {
        const txn = txnMap.get(event.receipt_id);
        const status = txn?.outcomes?.status;
        const meta = event.meta;

        stringifier.write({
          affected: event.affected_account_id || 'system',
          block: txn?.block?.block_height ?? '',
          contract: meta?.contract ?? '',
          direction: BigInt(event.delta_amount) > 0n ? 'In' : 'Out',
          hash: txn?.transaction_hash ?? '',
          id: event.token_id,
          involved: event.involved_account_id || 'system',
          method: event.cause,
          status: status ? 'Success' : status === null ? 'Pending' : 'Failed',
          timestamp: dayjs(+nsToMsTime(event.block_timestamp)).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
          token: meta ? `${meta.name} (${meta.symbol})` : '',
        });
      });
    }

    stringifier.end();
  },
);

export default { count, exports, txns };
