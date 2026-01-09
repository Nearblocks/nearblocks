import { unionWith } from 'es-toolkit';

import type {
  AccountStakingTxn,
  AccountStakingTxnCount,
  AccountStakingTxnCountReq,
  AccountStakingTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/staking/request.js';
import response from 'nb-schemas/dist/accounts/staking/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbStaking, pgp } from '#libs/pgp';
import {
  paginateData,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
  windowStart,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/accounts';

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<AccountStakingTxnsReq>) => {
    const account = req.validator.account;
    const contract = req.validator.contract;
    const type = req.validator.type;
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
      Omit<AccountStakingTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbStaking.manyOrNone<
        Omit<AccountStakingTxn, 'block' | 'transaction_hash'>
      >(sql.staking.txns, {
        account,
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
        type,
      });
    };

    const events = await rollingWindowList(eventsQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: windowStart(config.baseStart, cursor?.timestamp, direction),
    });

    if (!events.length) {
      return { data: [] };
    }

    const queries = events.map((event) => {
      return pgp.as.format(sql.staking.txn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<AccountStakingTxn>(unionQuery);

    // If lengths don't match, receipts are missing (maybe delayed).
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
  async (req: RequestValidator<AccountStakingTxnCountReq>) => {
    const account = req.validator.account;
    const contract = req.validator.contract;
    const type = req.validator.type;
    const before = req.validator.before_ts;

    const estimated = await dbStaking.one<AccountStakingTxnCount>(
      sql.staking.estimate,
      {
        account,
        before,
        contract,
        type,
      },
    );

    return { data: estimated };
  },
);

export default { count, txns };
