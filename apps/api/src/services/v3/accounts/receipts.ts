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
  windowEnd,
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
    const before = req.validator.before_ts;
    const action = req.validator.action;
    const method = req.validator.method;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

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
          before,
          cursor: {
            index: cursor?.index,
            shard: cursor?.shard,
            timestamp: cursor?.timestamp,
          },
          direction,
          end,
          limit,
          method,
          predecessor: predecessor || account,
          receiver: receiver || account,
          start,
        },
      );

      return dbBase.manyOrNone<AccountReceipt>(sql.receipts.receipts, { cte });
    };

    const receipts = await rollingWindowList(receiptsQuery, {
      end: windowEnd(cursor?.timestamp, before),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: config.baseStart,
    });

    return paginateData(
      receipts,
      limit,
      direction,
      (receipt) => ({
        index: receipt.index_in_chunk,
        shard: receipt.shard_id,
        timestamp: receipt.included_in_block_timestamp,
      }),
      !!cursor,
    );
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<AccountReceiptCountReq>) => {
    const account = req.validator.account;
    const predecessor = req.validator.predecessor;
    const receiver = req.validator.receiver;
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
