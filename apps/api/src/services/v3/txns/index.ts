import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, pgp } from '#libs/pgp';
import redis from '#libs/redis';
import { paginateData, rollingWindow, rollingWindowList } from '#libs/response';
import { TxnReceipts } from '#libs/schema/v2/txns';
import { responseHandler } from '#middlewares/response';
import { RequestValidator } from '#middlewares/validate';
import request, {
  TxnReceiptsReq,
  TxnReq,
  TxnsCountReq,
  TxnsLatestReq,
  TxnsReq,
} from '#schemas/txns/request';
import response, { Txn, TxnCount, Txns } from '#schemas/txns/response';
import sql from '#sql/txns';

const latest = responseHandler(
  response.txns,
  async (req: RequestValidator<TxnsLatestReq>) => {
    const limit = req.validator.limit;

    const txns = await redis.cache<Txns[]>(
      `txns:latest:${limit}`,
      () => {
        return rollingWindowList<Txns>(
          (start, end) => {
            const cte = pgp.as.format(sql.latestCte, { end, limit, start });

            return dbBase.manyOrNone<Txns>(sql.txns, { cte });
          },
          { limit, start: config.baseStart },
        );
      },
      5, // cache results for 5s
    );

    return { data: txns };
  },
);

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<TxnsReq>) => {
    const limit = req.validator.limit;
    const block = req.validator.block;
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
      : null;

    const txns = await rollingWindowList(
      async (start, end, limit) => {
        const cte = pgp.as.format(sql.txnsCte, {
          after: start,
          before: end,
          block,
          cursor: {
            index: cursor?.index,
            shard: cursor?.shard,
            timestamp: cursor?.timestamp,
          },
          limit,
        });

        return dbBase.manyOrNone<Txns>(sql.txns, { cte });
      },
      {
        end: cursor?.timestamp
          ? BigInt(cursor.timestamp)
          : before
          ? BigInt(before)
          : undefined,
        // Fetch one extra to check if there is a next page
        limit: limit + 1,
        start: after ? BigInt(after) : config.baseStart,
      },
    );

    return paginateData(txns, limit, (txn) => ({
      index: txn.index_in_chunk,
      shard: txn.shard_id,
      timestamp: txn.block_timestamp,
    }));
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<TxnsCountReq>) => {
    const block = req.validator.block;
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;

    if (block) {
      const txn = await rollingWindow(
        async (start, end) =>
          dbBase.oneOrNone<Txn>(sql.count, {
            after: start,
            before: end,
            block,
          }),
        { start: config.baseStart },
      );

      return { data: txn };
    }

    const estimated = await dbBase.one<TxnCount>(sql.estimate, {
      after,
      before,
    });

    const cost = +estimated.cost;
    const count = +estimated.count;

    if (cost > config.maxQueryCost && count > config.maxQueryRows) {
      return { data: estimated };
    }

    const txn = await dbBase.one<TxnCount>(sql.count, { after, before, block });

    return { data: txn };
  },
);

const txn = responseHandler(
  response.txn,
  async (req: RequestValidator<TxnReq>) => {
    const hash = req.validator.hash;

    if (hash.startsWith('0x')) {
      const txn = await rollingWindow(
        async (start, end) => {
          const cte = pgp.as.format(sql.ethCte, { end, hash, start });

          return dbBase.oneOrNone<Txn>(sql.txn, { cte });
        },
        { start: config.baseStart },
      );

      return { data: txn };
    }

    const txn = await rollingWindow(
      async (start, end) => {
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

    const receipts = await rollingWindow(
      async (start, end) => {
        const cte = pgp.as.format(sql.txnCte, { end, hash, start });

        return dbBase.oneOrNone<TxnReceipts>(sql.receipts, { cte });
      },
      { start: config.baseStart },
    );

    return { data: receipts };
  },
);

export default { count, latest, receipts, txn, txns };
