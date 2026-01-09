import { unionWith } from 'es-toolkit';

import type {
  AccountNFTTxn,
  AccountNFTTxnCount,
  AccountNFTTxnCountReq,
  AccountNFTTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/nfts/request.js';
import response from 'nb-schemas/dist/accounts/nfts/response.js';

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
import sql from '#sql/accounts';

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<AccountNFTTxnsReq>) => {
    const account = req.validator.account;
    const contract = req.validator.contract;
    const token = req.validator.token;
    const involved = req.validator.involved;
    const cause = req.validator.cause;
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
      Omit<AccountNFTTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<
        Omit<AccountNFTTxn, 'block' | 'transaction_hash'>
      >(sql.nfts.txns, {
        account,
        before,
        cause,
        contract,
        cursor: {
          index: cursor?.index,
          shard: cursor?.shard,
          timestamp: cursor?.timestamp,
        },
        direction,
        end,
        involved,
        limit,
        start,
        token,
      });
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
      return pgp.as.format(sql.nfts.txn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<AccountNFTTxn>(unionQuery);

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

const count = responseHandler(
  response.count,
  async (req: RequestValidator<AccountNFTTxnCountReq>) => {
    const account = req.validator.account;
    const contract = req.validator.contract;
    const token = req.validator.token;
    const involved = req.validator.involved;
    const cause = req.validator.cause;
    const before = req.validator.before_ts;

    const estimated = await dbEvents.one<AccountNFTTxnCount>(
      sql.nfts.estimate,
      {
        account,
        before,
        cause,
        contract,
        involved,
        token,
      },
    );

    return { data: estimated };
  },
);

export default { count, txns };
