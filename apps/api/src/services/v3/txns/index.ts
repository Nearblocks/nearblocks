import type {
  Txn,
  TxnCountReq,
  TxnFT,
  TxnFTsReq,
  TxnMT,
  TxnMTsReq,
  TxnNFT,
  TxnNFTsReq,
  TxnReceipt,
  TxnReceiptsReq,
  TxnReq,
  TxnsLatestReq,
  TxnsReq,
  TxnStats,
} from 'nb-schemas';
import request from 'nb-schemas/dist/txns/request.js';
import response from 'nb-schemas/dist/txns/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import redis from '#libs/redis';
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
import { resolveTxnAnchor, TxnAnchor } from '#libs/txnAnchor';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/txns';

const sortFtEvents = (events: TxnFT[]): TxnFT[] =>
  events.sort((a, b) => {
    const tsDiff = BigInt(a.block_timestamp) - BigInt(b.block_timestamp);
    if (tsDiff !== 0n) return tsDiff < 0n ? -1 : 1;
    if (a.shard_id !== b.shard_id) return a.shard_id - b.shard_id;
    if (a.event_type !== b.event_type) return a.event_type - b.event_type;
    return a.event_index - b.event_index;
  });

const sortEvents = <
  T extends { block_timestamp: string; event_index: number; shard_id: number },
>(
  events: T[],
): T[] =>
  events.sort((a, b) => {
    const tsDiff = BigInt(a.block_timestamp) - BigInt(b.block_timestamp);
    if (tsDiff !== 0n) return tsDiff < 0n ? -1 : 1;
    if (a.shard_id !== b.shard_id) return a.shard_id - b.shard_id;
    return a.event_index - b.event_index;
  });

const latest = responseHandler(
  response.txns,
  async (req: RequestValidator<TxnsLatestReq>) => {
    const limit = req.validator.limit;

    const rollingQuery = rollingWindowList<Txn>(
      (start, end) => {
        const cte = pgp.as.format(sql.latestCte, { end, limit, start });

        return dbBase.manyOrNone<Txn>(sql.txns, { cte, direction: 'desc' });
      },
      { limit, start: config.baseStart },
    );

    const txns = await redis.cache<Txn[]>(
      `v3:txns:latest:${limit}`,
      () => rollingQuery,
      5, // cache results for 5s
    );

    return { data: txns };
  },
);

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<TxnsReq>) => {
    const block = req.validator.block;
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

    const txnsQuery: WindowListQuery<Txn> = (start, end, limit) => {
      const cte = pgp.as.format(sql.txnsCte, {
        before,
        block,
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

      return dbBase.manyOrNone<Txn>(sql.txns, { cte, direction });
    };

    const txns = await rollingWindowList(txnsQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: windowStart(config.baseStart, cursor?.timestamp, direction),
    });

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
  async (req: RequestValidator<TxnCountReq>) => {
    const block = req.validator.block;
    const before = req.validator.before_ts;

    if (!block && !before) {
      const result = await dbBase.one<{ count: string }>(sql.countCagg);
      const count = await countFromCagg(
        result.count,
        config.maxQueryCount,
        () =>
          rollingWindowCount(
            (start, end, limit) =>
              dbBase.one<{ count: string }>(sql.count, {
                before,
                block,
                end,
                limit,
                start,
              }),
            { limit: config.maxQueryCount, start: config.baseStart },
          ),
      );

      return { data: { count } };
    }

    const beforeTs = before ? BigInt(before) - 1n : undefined;
    const count = await rollingWindowCount(
      (start, end, limit) =>
        dbBase.one<{ count: string }>(sql.count, {
          before,
          block,
          end,
          limit,
          start,
        }),
      { end: beforeTs, limit: config.maxQueryCount, start: config.baseStart },
    );

    return { data: { count: cappedCount(count, config.maxQueryCount) } };
  },
);

const stats = responseHandler(response.stats, async () => {
  const data = await dbBase.oneOrNone<TxnStats>(sql.stats);

  return { data };
});

const txn = responseHandler(
  response.txn,
  async (req: RequestValidator<TxnReq>) => {
    const anchor = await resolveTxnAnchor(req.validator.hash);

    if (!anchor) return { data: null };

    const cte = pgp.as.format(sql.anchorCte, anchor);
    const txn = await dbBase.oneOrNone<Txn>(sql.txn, { cte });

    return { data: txn };
  },
);

const receipts = responseHandler(
  response.receipts,
  async (req: RequestValidator<TxnReceiptsReq>) => {
    const anchor = await resolveTxnAnchor(req.validator.hash);

    if (!anchor) return { data: null };

    const cte = pgp.as.format(sql.anchorCte, anchor);
    const receipts = await dbBase.oneOrNone<TxnReceipt>(sql.receipts, {
      cte,
    });

    return { data: receipts };
  },
);

const fetchReceiptIds = (anchor: TxnAnchor) =>
  dbBase.any<{ block_timestamp: string; receipt_id: string }>(sql.receiptIds, {
    block_timestamp: anchor.block_timestamp,
    transaction_hash: anchor.transaction_hash,
  });

const fts = responseHandler(
  response.fts,
  async (req: RequestValidator<TxnFTsReq>) => {
    const anchor = await resolveTxnAnchor(req.validator.hash);

    if (!anchor) return { data: [] };

    const receipts = await fetchReceiptIds(anchor);

    if (!receipts.length) return { data: [] };

    const fts = await dbEvents.manyOrNone<TxnFT>(sql.ft, {
      block_timestamp: anchor.block_timestamp,
      receipt_ids: receipts.map((r) => r.receipt_id),
    });

    return { data: sortFtEvents(fts) };
  },
);

const nfts = responseHandler(
  response.nfts,
  async (req: RequestValidator<TxnNFTsReq>) => {
    const anchor = await resolveTxnAnchor(req.validator.hash);

    if (!anchor) return { data: [] };

    const receipts = await fetchReceiptIds(anchor);

    if (!receipts.length) return { data: [] };

    const nfts = await dbEvents.manyOrNone<TxnNFT>(sql.nft, {
      block_timestamp: anchor.block_timestamp,
      receipt_ids: receipts.map((r) => r.receipt_id),
    });

    return { data: sortEvents(nfts) };
  },
);

const mts = responseHandler(
  response.mts,
  async (req: RequestValidator<TxnMTsReq>) => {
    const anchor = await resolveTxnAnchor(req.validator.hash);

    if (!anchor) return { data: [] };

    const receipts = await fetchReceiptIds(anchor);

    if (!receipts.length) return { data: [] };

    const mts = await dbEvents.manyOrNone<TxnMT>(sql.mt, {
      block_timestamp: anchor.block_timestamp,
      receipt_ids: receipts.map((r) => r.receipt_id),
    });

    return { data: sortEvents(mts) };
  },
);

export default { count, fts, latest, mts, nfts, receipts, stats, txn, txns };
