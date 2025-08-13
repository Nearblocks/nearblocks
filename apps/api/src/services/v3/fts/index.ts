import { unionWith } from 'es-toolkit';

import type { FTTxn, FTTxnCount, FTTxnsReq } from 'nb-schemas';
import request from 'nb-schemas/dist/fts/request.js';
import response from 'nb-schemas/dist/fts/response.js';

import cursors from '#libs/cursors';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import {
  paginateData,
  rollingWindowList,
  WindowListQuery,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/fts';

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<FTTxnsReq>) => {
    const limit = req.validator.limit;
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
      : null;

    const eventsQuery: WindowListQuery<
      Omit<FTTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<Omit<FTTxn, 'block' | 'transaction_hash'>>(
        sql.events,
        {
          after: start,
          before: end,
          cursor: {
            index: cursor?.index,
            shard: cursor?.shard,
            timestamp: cursor?.timestamp,
            type: cursor?.type,
          },
          limit,
        },
      );
    };

    const events = await rollingWindowList(eventsQuery, {
      end: cursor?.timestamp ? BigInt(cursor.timestamp) : undefined,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    const queries = events.map((signature) => {
      return pgp.as.format(sql.eventTxn, signature);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<FTTxn>(unionQuery);

    // Lengths don't match, it means receipts are missing due to slower indexing.
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

const count = responseHandler(response.count, async () => {
  const txns = await dbEvents.one<FTTxnCount>(sql.eventsCount);

  return { data: txns };
});

export default { count, txns };
