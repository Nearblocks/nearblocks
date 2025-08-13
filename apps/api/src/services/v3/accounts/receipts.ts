import type {
  AccountReceipt,
  AccountReceiptCount,
  AccountReceiptCountReq,
  AccountReceiptsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/receipts/request.js';
import response from 'nb-schemas/dist/accounts/receipts/response.js';

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

const receipts = responseHandler(
  response.receipts,
  async (req: RequestValidator<AccountReceiptsReq>) => {
    const account = req.validator.account;
    const predecessor = req.validator.predecessor;
    const receiver = req.validator.receiver;
    const limit = req.validator.limit;
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;
    const action = req.validator.action;
    const method = req.validator.method;
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
      : null;

    if (
      predecessor &&
      receiver &&
      predecessor !== account &&
      receiver !== account
    ) {
      return { data: [] };
    }

    const receiptsQuery: WindowListQuery<AccountReceipt> = (
      start,
      end,
      limit,
    ) => {
      const cte = pgp.as.format(
        predecessor || receiver ? sql.receipts.cte : sql.receipts.cteUnion,
        {
          action,
          after: start,
          before: end,
          cursor: {
            index: cursor?.index,
            shard: cursor?.shard,
            timestamp: cursor?.timestamp,
          },
          limit,
          method,
          predecessor: predecessor || account,
          receiver: receiver || account,
        },
      );

      return dbBase.manyOrNone<AccountReceipt>(sql.receipts.receipts, { cte });
    };

    const receipts = await rollingWindowList(receiptsQuery, {
      end: cursor?.timestamp
        ? BigInt(cursor.timestamp)
        : before
        ? BigInt(before)
        : undefined,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: after ? BigInt(after) : config.baseStart,
    });

    return paginateData(receipts, limit, (receipt) => ({
      index: receipt.index_in_chunk,
      shard: receipt.shard_id,
      timestamp: receipt.included_in_block_timestamp,
    }));
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<AccountReceiptCountReq>) => {
    const account = req.validator.account;
    const predecessor = req.validator.predecessor;
    const receiver = req.validator.receiver;
    const after = req.validator.after_ts;
    const before = req.validator.before_ts;
    const action = req.validator.action;
    const method = req.validator.method;

    if (
      predecessor &&
      receiver &&
      predecessor !== account &&
      receiver !== account
    ) {
      return { data: { count: 0 } };
    }

    const estimated = await dbBase.one<AccountReceiptCount>(
      sql.receipts.estimate,
      {
        action,
        after,
        before,
        method,
        predecessor: predecessor || account,
        receiver: receiver || account,
      },
    );

    return { data: estimated };
  },
);

export default { count, receipts };
