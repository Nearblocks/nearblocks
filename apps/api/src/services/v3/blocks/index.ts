import { responseHandler } from '#libs/handler';
import { dbBase } from '#libs/pgp';
import { RequestValidator } from '#middlewares/validate';
import { BlockList } from '#schemas/blocks/request';
import { blockListResponse } from '#schemas/blocks/response';
import sql from '#sql/blocks';

const blockList = responseHandler(
  blockListResponse,
  async (req: RequestValidator<BlockList>) => {
    const limit = req.validator.limit;

    const blocks = await dbBase.manyOrNone(sql.list, { limit });

    console.log({ blocks });

    return { data: blocks, meta: {} };
  },
);

export default { blockList };
