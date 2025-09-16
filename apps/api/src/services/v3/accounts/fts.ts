import { unionWith } from 'es-toolkit';

import type {
  AccountFTTxn,
  AccountFTTxnCount,
  AccountFTTxnCountReq,
  AccountFTTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/fts/request.js';
import response from 'nb-schemas/dist/accounts/fts/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import {
  paginateData,
  rollingWindowList,
  WindowListQuery,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/accounts';

const fts = responseHandler(
  response.fts,
  async (req: RequestValidator<AccountFTTxnsReq>) => {
    const account = req.validator.account;
    const contract = req.validator.contract;
    const involved = req.validator.involved;
    const cause = req.validator.cause;
    const limit = req.validator.limit;
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
      : null;

    const eventsQuery: WindowListQuery<
      Omit<AccountFTTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<
        Omit<AccountFTTxn, 'block' | 'transaction_hash'>
      >(sql.fts.txns, {
        account,
        after: start,
        before: end,
        cause,
        contract,
        cursor: {
          index: cursor?.index,
          shard: cursor?.shard,
          timestamp: cursor?.timestamp,
          type: cursor?.type,
        },
        involved,
        limit,
      });
    };

    const events = await rollingWindowList(eventsQuery, {
      end: cursor?.timestamp
        ? BigInt(cursor.timestamp)
        : before
        ? BigInt(before)
        : undefined,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: after ? BigInt(after) : config.baseStart,
    });

    if (!events.length) {
      return { data: [] };
    }

    const queries = events.map((event) => {
      return pgp.as.format(sql.fts.txn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<AccountFTTxn>(unionQuery);

    // If lengths don't match, receipts are missing (maybe delayed).
    if (txns.length !== events.length) {
      const merged = unionWith(
        txns,
        events,
        (a, b) =>
          `${a.block_timestamp}${a.shard_id}${a.event_type}${a.event_index}` ===
          `${b.block_timestamp}${b.shard_id}${b.event_type}${b.event_index}`,
      );

      return paginateData(merged, limit, (txn) => ({
        index: txn.event_index,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
        type: txn.event_type,
      }));
    }

    return paginateData(txns, limit, (txn) => ({
      index: txn.event_index,
      shard: txn.shard_id,
      timestamp: txn.block_timestamp,
      type: txn.event_type,
    }));
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<AccountFTTxnCountReq>) => {
    const account = req.validator.account;
    const contract = req.validator.contract;
    const involved = req.validator.involved;
    const cause = req.validator.cause;
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;

    const estimated = await dbEvents.one<AccountFTTxnCount>(sql.fts.estimate, {
      account,
      after,
      before,
      cause,
      contract,
      involved,
    });

    return { data: estimated };
  },
);

export default { count, fts };
