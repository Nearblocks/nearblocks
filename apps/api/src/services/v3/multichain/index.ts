import { unionWith } from 'es-toolkit';

import type {
  MCStats,
  MCTxn,
  MCTxnCount,
  MCTxnCountReq,
  MCTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/multichain/request.js';
import response from 'nb-schemas/dist/multichain/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbMultichain, pgp } from '#libs/pgp';
import {
  paginateData,
  rollingWindowCount,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
  windowStart,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/multichain';

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<MCTxnsReq>) => {
    const limit = req.validator.limit;
    const account = req.validator.account;
    const address = req.validator.address;
    const before = req.validator.before_ts;
    const chain = req.validator.chain;
    const txn = req.validator.txn;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const signaturesQuery: WindowListQuery<
      Omit<MCTxn, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbMultichain.manyOrNone<Omit<MCTxn, 'block' | 'transaction_hash'>>(
        sql.signatures,
        {
          account,
          address,
          before,
          chain,
          cursor: {
            index: cursor?.index,
            timestamp: cursor?.timestamp,
          },
          direction,
          end,
          limit,
          start,
          txn,
        },
      );
    };

    const signatures = await rollingWindowList(signaturesQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: windowStart(config.baseStart, cursor?.timestamp, direction),
    });

    if (!signatures.length) {
      return { data: [] };
    }

    const queries = signatures.map((signature) => {
      return pgp.as.format(sql.signatureTxn, signature);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<MCTxn>(unionQuery);

    // If lengths don't match, receipts are missing (maybe delayed).
    if (txns.length !== signatures.length) {
      const merged = unionWith(
        txns,
        signatures,
        (a, b) =>
          `${a.block_timestamp}${a.event_index}` ===
          `${b.block_timestamp}${b.event_index}`,
      );

      return paginateData(
        merged,
        limit,
        direction,
        (txn) => ({
          index: txn.event_index,
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
        timestamp: txn.block_timestamp,
      }),
      !!cursor,
    );
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<MCTxnCountReq>) => {
    const account = req.validator.account;
    const address = req.validator.address;
    const before = req.validator.before_ts;
    const chain = req.validator.chain;
    const txn = req.validator.txn;

    const estimated = await dbMultichain.one<MCTxnCount>(
      sql.signatureEstimate,
      {
        account,
        address,
        before,
        chain,
        txn,
      },
    );

    if (
      +estimated.count < config.maxQueryRows ||
      +estimated.cost < config.maxQueryCost
    ) {
      const beforeTs = before ? BigInt(before) - 1n : undefined;
      const count = await rollingWindowCount(
        (start, end) =>
          dbMultichain.one<{ count: string }>(sql.signatureCount, {
            account,
            address,
            before,
            chain,
            end,
            start,
            txn,
          }),
        { end: beforeTs, limit: config.maxQueryRows, start: config.baseStart },
      );

      return { data: { cost: estimated.cost, count: String(count) } };
    }

    return { data: estimated };
  },
);

const stats = responseHandler(response.stats, async () => {
  const data = await dbMultichain.oneOrNone<MCStats>(sql.stats);

  return { data };
});

export default { count, stats, txns };
