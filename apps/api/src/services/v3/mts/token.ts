import { unionWith } from 'es-toolkit';

import type {
  MTToken,
  MTTokenCount,
  MTTokenCountReq,
  MTTokenHolder,
  MTTokenHolderCount,
  MTTokenHolderCountReq,
  MTTokenHoldersReq,
  MTTokenList,
  MTTokenListReq,
  MTTokenReq,
  MTTokenTxn,
  MTTokenTxnCountReq,
  MTTokenTxnsReq,
} from 'nb-schemas/dist/mts/tokens/index.js';
import request from 'nb-schemas/dist/mts/tokens/request.js';
import response from 'nb-schemas/dist/mts/tokens/response.js';

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

const list = responseHandler(
  response.list,
  async (req: RequestValidator<MTTokenListReq>) => {
    const contract = req.validator.contract;
    const type = req.validator.type ?? 'ft';
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const sortByPrice = req.validator.type === 'ft';
    const sqlQuery = sortByPrice ? sql.tokens.tokensByPrice : sql.tokens.tokens;
    const tokenDirection = direction === 'asc' ? 'desc' : 'asc';
    const nullsOrder = direction === 'desc' ? 'LAST' : 'FIRST';

    const data = await dbEvents.manyOrNone<MTTokenList>(sqlQuery, {
      contract,
      cursor: {
        price: sortByPrice ? cursor?.price ?? null : undefined,
        token: cursor?.token,
      },
      direction,
      limit: limit + 1,
      nullsOrder,
      tokenDirection,
      type,
    });

    return paginateData(
      data,
      limit,
      direction,
      (item) => ({
        contract: item.contract,
        ...(sortByPrice ? { price: item.price ?? null } : {}),
        token: item.token,
      }),
      !!cursor,
    );
  },
);

const tokenCount = responseHandler(
  response.count,
  async (req: RequestValidator<MTTokenCountReq>) => {
    const contract = req.validator.contract;
    const type = req.validator.type ?? null;

    const data = await dbEvents.one<MTTokenCount>(sql.tokens.tokenCount, {
      contract,
      type,
    });

    return { data };
  },
);

const token = responseHandler(
  response.token,
  async (req: RequestValidator<MTTokenReq>) => {
    const contract = req.validator.contract;
    const token = req.validator.token;

    const data = await dbEvents.oneOrNone<MTToken>(sql.tokens.token, {
      contract,
      token,
    });

    return { data };
  },
);

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<MTTokenTxnsReq>) => {
    const contract = req.validator.contract;
    const token = req.validator.token;
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
      Omit<MTTokenTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<
        Omit<MTTokenTxn, 'block' | 'transaction_hash'>
      >(sql.tokens.tokenTxns, {
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
      });
    };

    const events = await rollingWindowList(eventsQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      limit: limit + 1,
      start: windowStart(config.eventsStart, cursor?.timestamp, direction),
    });

    if (!events.length) {
      return { data: [] };
    }

    const queries = events.map((event) => {
      return pgp.as.format(sql.tokens.tokenTxn, event);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<MTTokenTxn>(unionQuery);

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
  async (req: RequestValidator<MTTokenTxnCountReq>) => {
    const contract = req.validator.contract;
    const token = req.validator.token;
    const before = req.validator.before_ts;

    const beforeTs = before ? BigInt(before) - 1n : undefined;
    const count = await rollingWindowCount(
      (start, end, limit) =>
        dbEvents.one<{ count: string }>(sql.tokens.tokenTxnCount, {
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

const holders = responseHandler(
  response.holders,
  async (req: RequestValidator<MTTokenHoldersReq>) => {
    const contract = req.validator.contract;
    const token = req.validator.token;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.tokenHoldersCursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.tokenHoldersCursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const accountDirection = prev ? 'desc' : 'asc';
    const cursor = prev || next;

    const data = await dbEvents.manyOrNone<MTTokenHolder>(
      sql.tokens.tokenHolders,
      {
        accountDirection,
        contract,
        cursor: {
          account: cursor?.account,
          amount: cursor?.amount,
        },
        direction,
        limit: limit + 1,
        token,
      },
    );

    return paginateData(
      data,
      limit,
      direction,
      (holder) => ({
        account: holder.account,
        amount: holder.amount,
      }),
      !!cursor,
    );
  },
);

const holderCount = responseHandler(
  response.holderCount,
  async (req: RequestValidator<MTTokenHolderCountReq>) => {
    const contract = req.validator.contract;
    const token = req.validator.token;

    const data = await dbEvents.one<MTTokenHolderCount>(
      sql.tokens.tokenHolderCount,
      { contract, token },
    );

    return { data };
  },
);

export default {
  holderCount,
  holders,
  list,
  token,
  tokenCount,
  txnCount,
  txns,
};
