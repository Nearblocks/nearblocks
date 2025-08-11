import type { AccessKey, AccessKeysReq } from 'nb-schemas';
import request from 'nb-schemas/dist/keys/request.js';
import response from 'nb-schemas/dist/keys/response.js';

import cursors from '#libs/cursors';
import { dbBase } from '#libs/pgp';
import { paginateData } from '#libs/response';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/keys';

const keys = responseHandler(
  response.keys,
  async (req: RequestValidator<AccessKeysReq>) => {
    const key = req.validator.key;
    const limit = req.validator.limit;
    const cursor = req.validator.cursor
      ? cursors.decode(request.cursor, req.validator.cursor)
      : null;

    const keys = await dbBase.manyOrNone<AccessKey>(sql.keys, {
      cursor: {
        account: cursor?.account,
        timestamp: cursor?.timestamp,
      },
      key,
      // Fetch one extra to check if there is a next page
      limit: limit + 1,
    });

    return paginateData(keys, limit, (key) => ({
      account: key.account_id,
      timestamp: key.action_timestamp,
    }));
  },
);

export default { keys };
