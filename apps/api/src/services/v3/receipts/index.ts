import type {
  Receipt,
  ReceiptCount,
  ReceiptCountReq,
  ReceiptsReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/receipts/request.js';
import response from 'nb-schemas/dist/receipts/response.js';

import config from '#config';
import { withCap } from '#libs/count';
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
import sql from '#sql/receipts';

const receipts = responseHandler(
  response.receipts,
  async (req: RequestValidator<ReceiptsReq>) => {
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

    if (block) {
      const blockRow = await dbBase.oneOrNone<{ block_timestamp: string }>(
        sql.blockTs,
        { block },
      );

      if (!blockRow) {
        return { data: [] };
      }

      const blockTs = BigInt(blockRow.block_timestamp);
      const cte = pgp.as.format(sql.cte, {
        before,
        block,
        cursor: {
          index: cursor?.index,
          shard: cursor?.shard,
          timestamp: cursor?.timestamp,
        },
        direction,
        end: blockTs,
        limit: limit + 1,
        start: blockTs,
      });

      const data = await dbBase.manyOrNone<Receipt>(sql.receipts, {
        cte,
        direction,
      });

      return paginateData(
        data,
        limit,
        direction,
        (receipt) => ({
          index: receipt.index_in_chunk,
          shard: receipt.shard_id,
          timestamp: receipt.included_in_block_timestamp,
        }),
        !!cursor,
      );
    }

    const receiptsQuery: WindowListQuery<Receipt> = (start, end, limit) => {
      const cte = pgp.as.format(sql.cte, {
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

      return dbBase.manyOrNone<Receipt>(sql.receipts, { cte, direction });
    };

    const data = await rollingWindowList(receiptsQuery, {
      direction,
      end: windowEnd(cursor?.timestamp, before, direction),
      limit: limit + 1,
      start: windowStart(config.baseStart, cursor?.timestamp, direction),
    });

    return paginateData(
      data,
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
  async (req: RequestValidator<ReceiptCountReq>) => {
    const block = req.validator.block;
    const before = req.validator.before_ts;

    if (block) {
      const blockRow = await dbBase.oneOrNone<{ block_timestamp: string }>(
        sql.blockTs,
        { block },
      );

      if (!blockRow) {
        return { data: { cost: '0', count: '0' } };
      }

      const blockTs = BigInt(blockRow.block_timestamp);
      const result = await dbBase.one<{ count: string }>(sql.count, {
        before,
        block,
        end: blockTs,
        start: blockTs,
      });

      return { data: { cost: '0', count: result.count } };
    }

    const estimated = await dbBase.one<ReceiptCount>(
      sql.estimate,
      withCap({
        before,
        block,
      }),
    );

    return { data: estimated };
  },
);

export default { count, receipts };
