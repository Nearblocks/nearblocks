import { unionWith } from 'es-toolkit';

import type {
  NFTToken,
  NFTTokenCount,
  NFTTokenCountReq,
  NFTTokenList,
  NFTTokenListReq,
  NFTTokenReq,
  NFTTokenTxn,
  NFTTokenTxnCount,
  NFTTokenTxnCountReq,
  NFTTokenTxnsReq,
} from 'nb-schemas/dist/nfts/tokens/index.js';
import request from 'nb-schemas/dist/nfts/tokens/request.js';
import response from 'nb-schemas/dist/nfts/tokens/response.js';

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
import sql from '#sql/nfts';

const list = responseHandler(
  response.list,
  async (req: RequestValidator<NFTTokenListReq>) => {
    const contract = req.validator.contract;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const data = await dbEvents.manyOrNone<NFTTokenList>(sql.tokens.tokens, {
      contract,
      cursor: {
        token: cursor?.token,
      },
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    return paginateData(
      data,
      limit,
      direction,
      (item) => ({
        contract: item.contract,
        token: item.token,
      }),
      !!cursor,
    );
  },
);

const tokenCount = responseHandler(
  response.count,
  async (req: RequestValidator<NFTTokenCountReq>) => {
    const contract = req.validator.contract;

    const data = await dbEvents.one<NFTTokenCount>(sql.tokens.tokenCount, {
      contract,
    });

    return { data };
  },
);

const token = responseHandler(
  response.token,
  async (req: RequestValidator<NFTTokenReq>) => {
    const contract = req.validator.contract;
    const token = req.validator.token;

    const data = await dbEvents.oneOrNone<NFTToken>(sql.tokens.token, {
      contract,
      token,
    });

    return { data };
  },
);

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<NFTTokenTxnsReq>) => {
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
      Omit<NFTTokenTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbEvents.manyOrNone<
        Omit<NFTTokenTxn, 'block' | 'transaction_hash'>
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
      // Fetch one extra to check if there is a next page
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
    const txns = await dbBase.manyOrNone<NFTTokenTxn>(unionQuery);

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
          contract: txn.contract_account_id,
          index: txn.event_index,
          shard: txn.shard_id,
          timestamp: txn.block_timestamp,
          token: txn.token_id,
        }),
        !!cursor,
      );
    }

    return paginateData(
      txns,
      limit,
      direction,
      (txn) => ({
        contract: txn.contract_account_id,
        index: txn.event_index,
        shard: txn.shard_id,
        timestamp: txn.block_timestamp,
        token: txn.token_id,
      }),
      !!cursor,
    );
  },
);

const txnCount = responseHandler(
  response.txnCount,
  async (req: RequestValidator<NFTTokenTxnCountReq>) => {
    const contract = req.validator.contract;
    const token = req.validator.token;
    const before = req.validator.before_ts;

    const data = await dbEvents.one<NFTTokenTxnCount>(
      sql.tokens.tokenTxnCount,
      {
        before,
        contract,
        token,
      },
    );

    return { data };
  },
);

export default { list, token, tokenCount, txnCount, txns };
