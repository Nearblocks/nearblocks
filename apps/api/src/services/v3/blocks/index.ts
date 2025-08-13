import type {
  Block,
  BlockCount,
  BlockReq,
  BlocksLatestReq,
  BlocksReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/blocks/request.js';
import response from 'nb-schemas/dist/blocks/response.js';

import cursors from '#libs/cursors';
import { dbBase } from '#libs/pgp';
import redis from '#libs/redis';
import {
  paginateData,
  rollingWindow,
  rollingWindowList,
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
          end,
          limit,
          start,
        });
      },
      { limit },
    );

    const blocks = await redis.cache<Block[]>(
      `blocks:latest:${limit}`,
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
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
      : null;

    const blocksQuery: WindowListQuery<Block> = (start, end, limit) => {
      return dbBase.manyOrNone<Block>(sql.blocks, {
        cursor: { timestamp: cursor?.timestamp },
        end,
        limit,
        start,
      });
    };

    const blocks = await rollingWindowList<Block>(blocksQuery, {
      end: cursor?.timestamp ? BigInt(cursor.timestamp) : undefined,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    return paginateData(blocks, limit, (txn) => ({
      timestamp: txn.block_timestamp,
    }));
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

    const block = await rollingWindow((start, end) => {
      return dbBase.oneOrNone<Block>(sql.block, {
        end,
        hash,
        height,
        start,
      });
    });

    return { data: block };
  },
);

export default { block, blocks, count, latest };
