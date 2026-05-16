import { unionWith } from 'es-toolkit';

import type {
  MTContractTxnCountReq,
  MTContractTxnsReq,
  MTTxn,
} from 'nb-schemas';
import request from 'nb-schemas/dist/mts/request.js';
import response from 'nb-schemas/dist/mts/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import {
  cappedCount,
  paginateData,
  rollingWindowCount,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
  windowStart,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/mts';

const txns = responseHandler(
  response.contractTxns,
  async (req: RequestValidator<MTContractTxnsReq>) => {
    const contract = req.validator.contract;
    const affected = req.validator.affected;
    const token = req.validator.token;
    const before = req.validator.before_ts;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const eventsQuery: WindowListQuery<
      Omit<MTTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<Omit<MTTxn, 'block' | 'transaction_hash'>>(
        sql.contractTxns,
        {
          affected,
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
          token,
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

    const queries = events.map((event) => pgp.as.format(sql.txn, event));
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<MTTxn>(unionQuery);

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

const txnCount = responseHandler(
  response.contractTxnCount,
  async (req: RequestValidator<MTContractTxnCountReq>) => {
    const contract = req.validator.contract;
    const affected = req.validator.affected;
    const token = req.validator.token;
    const before = req.validator.before_ts;

    const beforeTs = before ? BigInt(before) - 1n : undefined;
    const count = await rollingWindowCount(
      (start, end, limit) =>
        dbEvents.one<{ count: string }>(sql.contractTxnCount, {
          affected,
          before,
          contract,
          end,
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

export default { txnCount, txns };
