import { unionWith } from 'es-toolkit';

import type {
  StakingTxn,
  StakingTxnCountReq,
  StakingTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/staking/request.js';
import response from 'nb-schemas/dist/staking/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbStaking, pgp } from '#libs/pgp';
import {
  countFromEstimate,
  paginateData,
  rollingWindowCount,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
  windowStart,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/staking';

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<StakingTxnsReq>) => {
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
      Omit<StakingTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbStaking.manyOrNone<
        Omit<StakingTxn, 'block' | 'transaction_hash'>
      >(sql.txns, {
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
      });
    };

    const events = await rollingWindowList(eventsQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      limit: limit + 1,
      start: windowStart(config.stakingStart, cursor?.timestamp, direction),
    });

    if (!events.length) {
      return { data: [] };
    }

    const queries = events.map((event) => pgp.as.format(sql.txn, event));
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<StakingTxn>(unionQuery);

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
  async (req: RequestValidator<StakingTxnCountReq>) => {
    const before = req.validator.before_ts;

    const beforeTs = before ? BigInt(before) - 1n : undefined;

    const count = await countFromEstimate({
      db: dbStaking,
      exactCount: () =>
        rollingWindowCount(
          (start, end, limit) =>
            dbStaking.one<{ count: string }>(sql.count, {
              before,
              end,
              limit,
              start,
            }),
          {
            end: beforeTs,
            limit: config.maxQueryCount,
            start: config.stakingStart,
          },
        ),
      limit: config.maxQueryCount,
      maxCost: config.maxQueryCost,
      maxRows: config.maxQueryRows,
      query: sql.countEstimate,
      values: {
        before: before ?? null,
        start: config.stakingStart.toString(),
      },
    });

    return { data: { count } };
  },
);

export default { count, txns };
