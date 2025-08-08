import type {
  AccountKeyCount,
  AccountKeyCountReq,
  AccountKeys,
  AccountKeysReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/keys/request.js';
import response from 'nb-schemas/dist/accounts/keys/response.js';

import cursors from '#libs/cursors';
import { dbBase } from '#libs/pgp';
import { paginateData } from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/accounts';

const keys = responseHandler(
  response.keys,
  async (req: RequestValidator<AccountKeysReq>) => {
    const account = req.validator.account;
    const limit = req.validator.limit;
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
      : null;

    const keys = await dbBase.manyOrNone<AccountKeys>(sql.keys.keys, {
      account,
      cursor: {
        key: cursor?.key,
        timestamp: cursor?.timestamp,
      },
      limit,
    });

    return paginateData(keys, limit, (key) => ({
      key: key.public_key,
      timestamp: key.block_timestamp,
    }));
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<AccountKeyCountReq>) => {
    const account = req.validator.account;

    const count = await dbBase.one<AccountKeyCount>(sql.keys.count, {
      account,
    });

    return { data: count };
  },
);

export default { count, keys };
