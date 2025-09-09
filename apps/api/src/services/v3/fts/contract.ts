import { unionWith } from 'es-toolkit';

import type {
  FTContractTxn,
  FTContractTxnCount,
  FTContractTxnCountReq,
  FTContractTxnsReq,
} from 'nb-schemas';
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
  response.contractTxns,
  async (req: RequestValidator<FTContractTxnsReq>) => {
    const contract = req.validator.contract;
    const affected = req.validator.affected;
    const involved = req.validator.involved;
    const limit = req.validator.limit;
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
      : null;

    console.log({ req });

    const eventsQuery: WindowListQuery<
      Omit<FTContractTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<
        Omit<FTContractTxn, 'block' | 'transaction_hash'>
      >(sql.contractTxns, {
        affected,
        contract,
        cursor: {
          index: cursor?.index,
          shard: cursor?.shard,
          timestamp: cursor?.timestamp,
          type: cursor?.type,
        },
        end,
        involved,
        limit,
        start,
      });
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
      return pgp.as.format(sql.contractTxn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<FTContractTxn>(unionQuery);

    // If lengths don't match, it means receipts are missing (maybe delayed).
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
  response.contractTxnCount,
  async (req: RequestValidator<FTContractTxnCountReq>) => {
    const contract = req.validator.contract;
    const affected = req.validator.affected;
    const involved = req.validator.involved;

    const txns = await dbEvents.one<FTContractTxnCount>(sql.contractTxnCount, {
      affected,
      contract,
      involved,
    });

    return { data: txns };
  },
);

export default { count, txns };
