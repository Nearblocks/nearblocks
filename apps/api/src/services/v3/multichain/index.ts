import type { McTxnCount, McTxnCountReq, McTxns, McTxnsReq } from 'nb-schemas';
import request from 'nb-schemas/dist/multichain/request.js';
import response from 'nb-schemas/dist/multichain/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, dbMultichain, pgp } from '#libs/pgp';
import {
  paginateData,
  rollingWindowList,
  WindowListQuery,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/multichain';

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<McTxnsReq>) => {
    const limit = req.validator.limit;
    const account = req.validator.account;
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
      : null;

    const signaturesQuery: WindowListQuery<
      Omit<McTxns, 'block' | 'transaction_hash'>
    > = (start, end, limit) => {
      return dbMultichain.manyOrNone<
        Omit<McTxns, 'block' | 'transaction_hash'>
      >(sql.signatures, {
        account,
        after: start,
        before: end,
        cursor: {
          index: cursor?.index,
          timestamp: cursor?.timestamp,
        },
        limit,
      });
    };

    const signatures = await rollingWindowList(signaturesQuery, {
      end: cursor?.timestamp
        ? BigInt(cursor.timestamp)
        : before
        ? BigInt(before)
        : undefined,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: after ? BigInt(after) : config.baseStart,
    });

    const queries = signatures.map((signature) => {
      return pgp.as.format(sql.signatureTxn, signature);
    });
    const unionQuery = queries.join('\nUNION ALL\n');
    const txns = await dbBase.manyOrNone<McTxns>(unionQuery);

    return paginateData(txns, limit, (txn) => ({
      index: txn.event_index,
      timestamp: txn.block_timestamp,
    }));
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<McTxnCountReq>) => {
    const account = req.validator.account;
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;

    const estimated = await dbMultichain.one<McTxnCount>(sql.signatureCount, {
      account,
      after,
      before,
    });

    const cost = +estimated.cost;
    const count = +estimated.count;

    if (cost > config.maxQueryCost && count > config.maxQueryRows) {
      return { data: estimated };
    }

    const txn = await dbMultichain.one<McTxnCount>(sql.signatureCount, {
      account,
      after,
      before,
    });

    return { data: txn };
  },
);

export default { count, txns };
