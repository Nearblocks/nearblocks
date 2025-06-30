import config from '#config';
import cursors from '#libs/cursors';
import { dbBase } from '#libs/pgp';
import redis from '#libs/redis';
import { paginateData, rollingWindow } from '#libs/response';
import { responseHandler } from '#middlewares/response';
import { RequestValidator } from '#middlewares/validate';
import request, {
  BlockReq,
  BlocksLatestReq,
  BlocksReq,
} from '#schemas/blocks/request';
import response, { Block, BlockCount } from '#schemas/blocks/response';
import sql from '#sql/blocks';

const latest = responseHandler(
  response.blocks,
  async (req: RequestValidator<BlocksLatestReq>) => {
    const limit = req.validator.limit;

    const blocks = await redis.cache<Block[]>(
      `blocks:latest:${limit}`,
      async () =>
        dbBase.manyOrNone<Block>(sql.blocks, {
          cursor: { timestamp: null },
          limit,
        }),
      5, // 5 sec,
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

    const blocks = await dbBase.manyOrNone<Block>(sql.blocks, {
      cursor: { timestamp: cursor?.timestamp },
      limit: limit + 1,
    });

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
      async (start, end) =>
        dbBase.oneOrNone<Block>(sql.block, { end, hash, height, start }),
      { start: config.baseStart },
    );

    return { data: block };
  },
);

export default { block, blocks, count, latest };
