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
import { paginateData, rollingWindow, rollingWindowList } from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/blocks';

const latest = responseHandler(
  response.blocks,
  async (req: RequestValidator<BlocksLatestReq>) => {
    const limit = req.validator.limit;

    const blocks = await redis.cache<Block[]>(
      `blocks:latest:${limit}`,
      () =>
        rollingWindowList<Block>(
          (start, end) =>
            dbBase.manyOrNone<Block>(sql.blocks, {
              cursor: { timestamp: null },
              end,
              limit,
              start,
            }),
          { limit, start: config.baseStart },
        ),
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

    const blocks = await rollingWindowList<Block>(
      (start, end, limit) =>
        dbBase.manyOrNone<Block>(sql.blocks, {
          cursor: { timestamp: cursor?.timestamp },
          end,
          limit,
          start,
        }),
      {
        end: cursor?.timestamp ? BigInt(cursor.timestamp) : undefined,
        // Fetch one extra to check if there is a next page
        limit: limit + 1,
        start: config.baseStart,
      },
    );

    return paginateData(blocks, limit, (txn) => ({
      timestamp: txn.block_timestamp,
    }));
  },
);

const count = responseHandler(response.count, async () => {
  const block = await dbBase.one<BlockCount>(sql.estimate);

  return { data: block };
});

const block = responseHandler(
  response.block,
  async (req: RequestValidator<BlockReq>) => {
    const input = req.validator.hash;
    const hash = input.length >= 43 ? input : null;
    const height = !isNaN(+input) ? +input : null;

    const block = await rollingWindow(
      (start, end) =>
        dbBase.oneOrNone<Block>(sql.block, { end, hash, height, start }),
      { start: config.baseStart },
    );

    return { data: block };
  },
);

export default { block, blocks, count, latest };
