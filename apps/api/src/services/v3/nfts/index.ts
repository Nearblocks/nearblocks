import { unionWith } from 'es-toolkit';

import type { NFTTxn, NFTTxnCount, NFTTxnsReq } from 'nb-schemas';
import request from 'nb-schemas/dist/nfts/request.js';
import response from 'nb-schemas/dist/nfts/response.js';

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

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<NFTTxnsReq>) => {
    const limit = req.validator.limit;
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
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

    if (!events.length) {
      return { data: [] };
    }

    const queries = events.map((event) => {
      return pgp.as.format(sql.txn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<NFTTxn>(unionQuery);

    // If lengths don't match, it means receipts are missing (maybe delayed).
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

const count = responseHandler(response.count, async () => {
  const txns = await dbEvents.one<NFTTxnCount>(sql.txnCount);

  return { data: txns };
});

export default { count, txns };
