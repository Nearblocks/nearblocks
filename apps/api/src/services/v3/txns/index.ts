import type {
  Txn,
  TxnCount,
  TxnCountReq,
  TxnFT,
  TxnFTsReq,
  TxnNFT,
  TxnNFTsReq,
  TxnReceipts,
  TxnReceiptsReq,
  TxnReq,
  TxnsLatestReq,
  TxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/txns/request.js';
import response from 'nb-schemas/dist/txns/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbEvents, pgp } from '#libs/pgp';
import redis from '#libs/redis';
import {
  paginateData,
  rollingWindow,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/txns';

const latest = responseHandler(
  response.txns,
  async (req: RequestValidator<TxnsLatestReq>) => {
    const limit = req.validator.limit;

    const rollingQuery = rollingWindowList<Txn>(
      (start, end) => {
        const cte = pgp.as.format(sql.latestCte, { end, limit, start });

        return dbBase.manyOrNone<Txn>(sql.txns, { cte });
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

      return dbBase.manyOrNone<Txn>(sql.txns, { cte });
    };

    const txns = await rollingWindowList(txnsQuery, {
      end: windowEnd(cursor?.timestamp, before),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: config.baseStart,
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

    if (block) {
      const txns = await rollingWindow(
        (start, end) => {
          return dbBase.oneOrNone<Pick<TxnCount, 'count'>>(sql.count, {
            before,
            block,
            end,
            start,
          });
        },
        { start: config.baseStart },
      );

      return { data: txns };
    }

    const estimated = await dbBase.one<TxnCount>(sql.estimate, {
      before,
    });

    const cost = +estimated.cost;
    const count = +estimated.count;

    if (cost > config.maxQueryCost && count > config.maxQueryRows) {
      return { data: estimated };
    }

    const txns = await dbBase.one<TxnCount>(sql.count, {
      before,
      block,
    });

    return { data: txns };
  },
);

const txn = responseHandler(
  response.txn,
  async (req: RequestValidator<TxnReq>) => {
    const hash = req.validator.hash;

    if (hash.startsWith('0x')) {
      const txn = await rollingWindow(
        (start, end) => {
          const cte = pgp.as.format(sql.rlpCte, { end, hash, start });

          return dbBase.oneOrNone<Txn>(sql.txn, { cte });
        },
        { start: config.baseStart },
      );

      return { data: txn };
    }

    const txn = await rollingWindow(
      (start, end) => {
        const cte = pgp.as.format(sql.txnCte, { end, hash, start });

        return dbBase.oneOrNone<Txn>(sql.txn, { cte });
      },
      { start: config.baseStart },
    );

    return { data: txn };
  },
);

const receipts = responseHandler(
  response.receipts,
  async (req: RequestValidator<TxnReceiptsReq>) => {
    const hash = req.validator.hash;

    if (hash.startsWith('0x')) {
      const receipts = await rollingWindow(
        (start, end) => {
          const cte = pgp.as.format(sql.rlpCte, { end, hash, start });

          return dbBase.oneOrNone<TxnReceipts>(sql.receipts, { cte });
        },
        { start: config.baseStart },
      );

      return { data: receipts };
    }

    const receipts = await rollingWindow(
      (start, end) => {
        const cte = pgp.as.format(sql.txnCte, { end, hash, start });

        return dbBase.oneOrNone<TxnReceipts>(sql.receipts, { cte });
      },
      { start: config.baseStart },
    );

    return { data: receipts };
  },
);

const fts = responseHandler(
  response.fts,
  async (req: RequestValidator<TxnFTsReq>) => {
    const hash = req.validator.hash;

    if (hash.startsWith('0x')) {
      const receipts = await rollingWindow<
        Pick<TxnFT, 'block_timestamp' | 'receipt_id'>[]
      >(
        async (start, end) => {
          const receipts = await dbBase.any<TxnFT>(sql.eventsRlp, {
            end,
            hash,
            start,
          });

          return receipts.length ? receipts : null;
        },
        { start: config.baseStart },
      );

      if (!receipts || !receipts.length) {
        return { data: [] };
      }

      const queries = receipts.map((receipt) => {
        return pgp.as.format(sql.ft, receipt);
      });
      const unionQuery = queries.join('\nUNION ALL\n');
      const fts = await dbEvents.manyOrNone<TxnFT>(unionQuery);

      return { data: fts };
    }

    const receipts = await rollingWindow<
      Pick<TxnFT, 'block_timestamp' | 'receipt_id'>[]
    >(
      async (start, end) => {
        const receipts = await dbBase.any<TxnFT>(sql.events, {
          end,
          hash,
          start,
        });

        return receipts.length ? receipts : null;
      },
      { start: config.baseStart },
    );

    if (!receipts || !receipts.length) {
      return { data: [] };
    }

    const queries = receipts.map((receipt) => {
      return pgp.as.format(sql.ft, receipt);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const fts = await dbEvents.manyOrNone<TxnFT>(unionQuery);

    return { data: fts };
  },
);

const nfts = responseHandler(
  response.nfts,
  async (req: RequestValidator<TxnNFTsReq>) => {
    const hash = req.validator.hash;

    if (hash.startsWith('0x')) {
      const receipts = await rollingWindow<
        Pick<TxnNFT, 'block_timestamp' | 'receipt_id'>[]
      >(
        async (start, end) => {
          const receipts = await dbBase.any<TxnNFT>(sql.eventsRlp, {
            end,
            hash,
            start,
          });

          return receipts.length ? receipts : null;
        },
        { start: config.baseStart },
      );

      if (!receipts || !receipts.length) {
        return { data: [] };
      }

      const queries = receipts.map((receipt) => {
        return pgp.as.format(sql.nft, receipt);
      });
      const unionQuery = queries.join('\nUNION ALL\n');
      const nfts = await dbEvents.manyOrNone<TxnNFT>(unionQuery);

      return { data: nfts };
    }

    const receipts = await rollingWindow<
      Pick<TxnNFT, 'block_timestamp' | 'receipt_id'>[]
    >(
      async (start, end) => {
        const receipts = await dbBase.any<TxnNFT>(sql.events, {
          end,
          hash,
          start,
        });

        return receipts.length ? receipts : null;
      },
      { start: config.baseStart },
    );

    if (!receipts || !receipts.length) {
      return { data: [] };
    }

    const queries = receipts.map((receipt) => {
      return pgp.as.format(sql.nft, receipt);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const nfts = await dbEvents.manyOrNone<TxnNFT>(unionQuery);

    return { data: nfts };
  },
);

export default { count, fts, latest, nfts, receipts, txn, txns };
