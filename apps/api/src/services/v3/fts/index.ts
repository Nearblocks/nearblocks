import { unionWith } from 'es-toolkit';

import type {
  FTCount,
  FTCountReq,
  FTList,
  FTListReq,
  FTTxn,
  FTTxnCount,
  FTTxnCountReq,
  FTTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/fts/request.js';
import response from 'nb-schemas/dist/fts/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import {
  paginateData,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
  windowStart,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/fts';

const list = responseHandler(
  response.list,
  async (req: RequestValidator<FTListReq>) => {
    const search = req.validator.search;
    const sort = req.validator.sort;
    const order = req.validator.order;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const list = await dbEvents.manyOrNone<FTList>(sql.list, {
      cursor: {
        contract: cursor?.contract,
        sort: cursor?.sort,
      },
      direction,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      order,
      order_by: order === 'desc' ? 'NULLS LAST' : 'NULLS FIRST',
      search: search ? `%${search}%` : null,
      sort,
    });

    return paginateData(
      list,
      limit,
      direction,
      (token) => ({
        contract: token.contract,
        sort,
      }),
      !!cursor,
    );
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<FTCountReq>) => {
    const search = req.validator.search;

    const txns = await dbEvents.one<FTCount>(sql.count, {
      search: search ? `%${search}%` : null,
    });

    return { data: txns };
  },
);

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<FTTxnsReq>) => {
    const before = req.validator.before_ts;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.txnsCursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.txnsCursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const eventsQuery: WindowListQuery<
      Omit<FTTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<Omit<FTTxn, 'block' | 'transaction_hash'>>(
        sql.txns,
        {
          before,
          cursor: {
            index: cursor?.index,
            shard: cursor?.shard,
            timestamp: cursor?.timestamp,
            type: cursor?.type,
          },
          direction,
          end,
          limit,
          start,
        },
      );
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
      return pgp.as.format(sql.txn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<FTTxn>(unionQuery);

    // If lengths don't match, receipts are missing (maybe delayed).
    if (txns.length !== events.length) {
      const merged = unionWith(
        txns,
        events,
        (a, b) =>
          `${a.block_timestamp}${a.shard_id}${a.event_type}${a.event_index}` ===
          `${b.block_timestamp}${b.shard_id}${b.event_type}${b.event_index}`,
      );

      return paginateData(
        merged,
        limit,
        direction,
        (txn) => ({
          index: txn.event_index,
          shard: txn.shard_id,
          timestamp: txn.block_timestamp,
          type: txn.event_type,
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
        type: txn.event_type,
      }),
      !!cursor,
    );
  },
);

const txnCount = responseHandler(
  response.txnCount,
  async (req: RequestValidator<FTTxnCountReq>) => {
    const before = req.validator.before_ts;

    const txns = await dbEvents.one<FTTxnCount>(sql.txnCount, {
      before,
    });

    return { data: txns };
  },
);

export default { count, list, txnCount, txns };
