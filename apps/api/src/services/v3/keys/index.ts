import type { AccessKey, AccessKeyReq } from 'nb-schemas';
import response from 'nb-schemas/dist/keys/response.js';

import { dbBase } from '#libs/pgp';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/keys';

const key = responseHandler(
  response.key,
  async (req: RequestValidator<AccessKeyReq>) => {
    const key = req.validator.key;

    const data = await dbBase.oneOrNone<AccessKey>(sql.key, { key });

    return { data };
  },
);

export default { key };
