import type {
  AccountTxn,
  AccountTxnCount,
  AccountTxnCountReq,
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
  windowEnd,
  WindowListQuery,
  windowStart,
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
    const before = req.validator.before_ts;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    if (signer && receiver && signer !== account && receiver !== account) {
      return { data: [] };
    }

    const txnsQuery: WindowListQuery<AccountTxn> = (start, end, limit) => {
      const cte = pgp.as.format(
        signer || receiver ? sql.txns.cte : sql.txns.cteUnion,
        {
          before,
          cursor: {
            index: cursor?.index,
            shard: cursor?.shard,
            timestamp: cursor?.timestamp,
          },
          direction,
          end,
          limit,
          receiver: receiver || account,
          signer: signer || account,
          start,
        },
      );

      return dbBase.manyOrNone<AccountTxn>(sql.txns.txns, { cte, direction });
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
  async (req: RequestValidator<AccountTxnCountReq>) => {
    const account = req.validator.account;
    const signer = req.validator.signer;
    const receiver = req.validator.receiver;
    const before = req.validator.before_ts;

    if (signer && receiver && signer !== account && receiver !== account) {
      return { data: { count: 0 } };
    }

    const estimated = await dbBase.one<AccountTxnCount>(sql.txns.estimate, {
      before,
      receiver: receiver || account,
      signer: signer || account,
    });

    return { data: estimated };
  },
);

export default { count, txns };
