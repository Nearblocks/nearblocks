import { unionWith } from 'es-toolkit';

import type {
  NFTCount,
  NFTCountReq,
  NFTList,
  NFTListReq,
  NFTTxn,
  NFTTxnCountReq,
  NFTTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/nfts/request.js';
import response from 'nb-schemas/dist/nfts/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbEvents } from '#libs/pgp';
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
import { bigintMax, bigintMin } from '#libs/utils';
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
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const list = await dbEvents.manyOrNone<NFTList>(sql.list, {
      cursor: {
        contract: cursor?.contract,
        sort: cursor?.sort,
      },
      has_cursor: !!cursor,
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
        sort: token[sort as keyof NFTList],
      }),
      !!cursor,
    );
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
    const before = req.validator.before_ts;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.txnCursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.txnCursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const eventsQuery: WindowListQuery<
      Omit<NFTTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<Omit<NFTTxn, 'block' | 'transaction_hash'>>(
        sql.txns,
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

    const eventTimestamps = events.map((e) => BigInt(e.block_timestamp));
    const txns = await dbBase.manyOrNone<NFTTxn>(sql.txn, {
      affected_account_id: events.map((e) => e.affected_account_id),
      block_timestamp: events.map((e) => e.block_timestamp),
      cause: events.map((e) => e.cause),
      contract_account_id: events.map((e) => e.contract_account_id),
      delta_amount: events.map((e) => e.delta_amount),
      end_timestamp: bigintMax(eventTimestamps).toString(),
      event_index: events.map((e) => e.event_index),
      involved_account_id: events.map((e) => e.involved_account_id),
      meta: events.map((e) => e.meta),
      receipt_id: events.map((e) => e.receipt_id),
      shard_id: events.map((e) => e.shard_id),
      start_timestamp: bigintMin(eventTimestamps).toString(),
      token_id: events.map((e) => e.token_id),
      token_meta: events.map((e) => e.token_meta),
    });

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
  response.txnCount,
  async (req: RequestValidator<NFTTxnCountReq>) => {
    const before = req.validator.before_ts;

    if (!before) {
      const result = await dbEvents.one<{ count: string }>(sql.txnCountCagg);
      const count = await countFromCagg(
        result.count,
        config.maxQueryCount,
        () =>
          rollingWindowCount(
            (start, end, limit) =>
              dbEvents.one<{ count: string }>(sql.txnCount, {
                before,
                end,
                limit,
                start,
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
        dbEvents.one<{ count: string }>(sql.txnCount, {
          before,
          end,
          limit,
          start,
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

export default { count, list, txnCount, txns };
