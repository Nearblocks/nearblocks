import type {
  AccountTxnCount,
  AccountTxnCountReq,
  AccountTxns,
  AccountTxnsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/txns/request.js';
import response from 'nb-schemas/dist/accounts/txns/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase, pgp } from '#libs/pgp';
import {
  paginateData,
  rollingWindowList,
  WindowListQuery,
} from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/accounts';

const txns = responseHandler(
  response.txns,
  async (req: RequestValidator<AccountTxnsReq>) => {
    const account = req.validator.account;
    const signer = req.validator.signer;
    const receiver = req.validator.receiver;
    const limit = req.validator.limit;
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
      : null;

    if (signer && receiver && signer !== account && receiver !== account) {
      return { data: [] };
    }

    const txnsQuery: WindowListQuery<AccountTxns> = (start, end, limit) => {
      const cte = pgp.as.format(
        signer || receiver ? sql.txns.cte : sql.txns.cteUnion,
        {
          after: start,
          before: end,
          cursor: {
            index: cursor?.index,
            shard: cursor?.shard,
            timestamp: cursor?.timestamp,
          },
          limit,
          receiver: receiver || account,
          signer: signer || account,
        },
      );

      return dbBase.manyOrNone<AccountTxns>(sql.txns.txns, { cte });
    };

    const txns = await rollingWindowList(txnsQuery, {
      end: cursor?.timestamp
        ? BigInt(cursor.timestamp)
        : before
        ? BigInt(before)
        : undefined,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: after ? BigInt(after) : config.baseStart,
    });

    return paginateData(txns, limit, (txn) => ({
      index: txn.index_in_chunk,
      shard: txn.shard_id,
      timestamp: txn.block_timestamp,
    }));
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<AccountTxnCountReq>) => {
    const account = req.validator.account;
    const signer = req.validator.signer;
    const receiver = req.validator.receiver;
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;

    if (signer && receiver && signer !== account && receiver !== account) {
      return { data: { count: 0 } };
    }

    const estimated = await dbBase.one<AccountTxnCount>(sql.txns.estimate, {
      after,
      before,
      receiver: receiver || account,
      signer: signer || account,
    });

    return { data: estimated };
  },
);

export default { count, txns };
