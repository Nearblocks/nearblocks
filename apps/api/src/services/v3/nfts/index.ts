import { unionWith } from 'es-toolkit';

import type {
  NFTCount,
  NFTCountReq,
  NFTList,
  NFTListReq,
  NFTTxn,
  NFTTxnCount,
  NFTTxnCountReq,
  NFTTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/nfts/request.js';
import response from 'nb-schemas/dist/nfts/response.js';

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
import sql from '#sql/nfts';

const list = responseHandler(
  response.list,
  async (req: RequestValidator<NFTListReq>) => {
    const search = req.validator.search;
    const sort = req.validator.sort;
    const order = req.validator.order;
    const limit = req.validator.limit;
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
      : null;

    const list = await dbEvents.manyOrNone<NFTList>(sql.list, {
      cursor: {
        contract: cursor?.contract,
        sort: cursor?.sort,
      },
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      order,
      order_by: order === 'desc' ? 'NULLS LAST' : 'NULLS FIRST',
      search: search ? `%${search}%` : null,
      sort,
    });

    return paginateData(list, limit, (token) => ({
      contract: token.contract,
      sort,
    }));
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<NFTCountReq>) => {
    const search = req.validator.search;

    const txns = await dbEvents.one<NFTCount>(sql.count, {
      search: search ? `%${search}%` : null,
    });

    return { data: txns };
  },
);

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<NFTTxnsReq>) => {
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;
    const limit = req.validator.limit;
    const cursor = req.validator.cursor
      ? cursors.decode(request.txnCursor, req.validator.cursor)
      : null;

    const eventsQuery: WindowListQuery<
      Omit<NFTTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<Omit<NFTTxn, 'block' | 'transaction_hash'>>(
        sql.txns,
        {
          after: start,
          before: end,
          cursor: {
            index: cursor?.index,
            shard: cursor?.shard,
            timestamp: cursor?.timestamp,
          },
          limit,
        },
      );
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
      return pgp.as.format(sql.txn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<NFTTxn>(unionQuery);

    // If lengths don't match, receipts are missing (maybe delayed).
    if (txns.length !== events.length) {
      const merged = unionWith(
        txns,
        events,
        (a, b) =>
          `${a.block_timestamp}${a.shard_id}${a.event_index}` ===
          `${b.block_timestamp}${b.shard_id}${b.event_index}`,
      );

      return paginateData(merged, limit, (txn) => ({
        index: txn.event_index,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
      }));
    }

    return paginateData(txns, limit, (txn) => ({
      index: txn.event_index,
      shard: txn.shard_id,
      timestamp: txn.block_timestamp,
    }));
  },
);

const txnCount = responseHandler(
  response.txnCount,
  async (req: RequestValidator<NFTTxnCountReq>) => {
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;
    const txns = await dbEvents.one<NFTTxnCount>(sql.txnCount, {
      after,
      before,
    });

    return { data: txns };
  },
);

export default { count, list, txnCount, txns };
