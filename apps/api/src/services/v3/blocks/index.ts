import type {
  Block,
  BlockCount,
  BlockReq,
  BlocksLatestReq,
  BlocksReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/blocks/request.js';
import response from 'nb-schemas/dist/blocks/response.js';

import config from '#config';
import cursors from '#libs/cursors';
import { dbBase } from '#libs/pgp';
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
import sql from '#sql/blocks';

const latest = responseHandler(
  response.blocks,
  async (req: RequestValidator<BlocksLatestReq>) => {
    const limit = req.validator.limit;

    const rollingQuery = rollingWindowList<Block>(
      (start, end) => {
        return dbBase.manyOrNone<Block>(sql.blocks, {
          cursor: { timestamp: null },
          direction: 'desc',
          end,
          limit,
          start,
        });
      },
      { limit, start: config.baseStart },
    );

    const blocks = await redis.cache<Block[]>(
      `v3:blocks:latest:${limit}`,
      () => rollingQuery,
      5, // cache results for 5s
    );

    return { data: blocks };
  },
);

const blocks = responseHandler(
  response.blocks,
  async (req: RequestValidator<BlocksReq>) => {
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const blocksQuery: WindowListQuery<Block> = (start, end, limit) => {
      return dbBase.manyOrNone<Block>(sql.blocks, {
        cursor: { timestamp: cursor?.timestamp },
        direction,
        end,
        limit,
        start,
      });
    };

    const blocks = await rollingWindowList<Block>(blocksQuery, {
      direction,
      end: windowEnd(cursor?.timestamp),
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
      start: config.baseStart,
    });

    return paginateData(
      blocks,
      limit,
      direction,
      (txn) => ({ timestamp: txn.block_timestamp }),
      !!cursor,
    );
  },
);

const count = responseHandler(response.count, async () => {
  const blocks = await dbBase.one<BlockCount>(sql.estimate);

  return { data: blocks };
});

const block = responseHandler(
  response.block,
  async (req: RequestValidator<BlockReq>) => {
    const input = req.validator.hash;
    const hash = input.length >= 43 ? input : null;
    const height = !isNaN(+input) ? +input : null;

    const block = await rollingWindow(
      (start, end) => {
        return dbBase.oneOrNone<Block>(sql.block, {
          end,
          hash,
          height,
          start,
        });
      },
      { start: config.baseStart },
    );

    return { data: block };
  },
);

export default { block, blocks, count, latest };
