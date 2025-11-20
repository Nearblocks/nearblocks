import type {
  AccountKey,
  AccountKeyCount,
  AccountKeyCountReq,
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
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const keys = await dbBase.manyOrNone<AccountKey>(sql.keys.keys, {
      account,
      cursor: {
        key: cursor?.key,
        timestamp: cursor?.timestamp,
      },
      direction,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    return paginateData(
      keys,
      limit,
      direction,
      (key) => ({
        key: key.public_key,
        timestamp: key.action_timestamp,
      }),
      !!cursor,
    );
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
