import type { Validator, ValidatorInfo, ValidatorsListReq } from 'nb-schemas';
import request from 'nb-schemas/dist/validators/request.js';
import response from 'nb-schemas/dist/validators/response.js';

import cursors from '#libs/cursors';
import { dbBase } from '#libs/pgp';
import { paginateData } from '#libs/response';
import { responseHandler } from '#middlewares/response';
import { RequestValidator } from '#middlewares/validate';
import sql from '#sql/validators';

const list = responseHandler(
  response.list,
  async (req: RequestValidator<ValidatorsListReq>) => {
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;
    const direction = prev ? 'asc' : 'desc';
    const cursor = prev || next;

    const stakeDir = direction === 'desc' ? 'DESC' : 'ASC';
    const nullsOrd = direction === 'desc' ? 'LAST' : 'FIRST';
    const accountDir = direction === 'desc' ? 'ASC' : 'DESC';

    const data = await dbBase.manyOrNone<Validator>(sql.list, {
      accountDir,
      cursor: cursor ?? { account_id: '', stake: null },
      direction,
      has_cursor: !!cursor,
      limit: limit + 1,
      nullsOrd,
      stakeDir,
    });

    return paginateData(
      data,
      limit,
      direction,
      (v) => ({ account_id: v.account_id, stake: v.current_epoch_stake }),
      !!cursor,
    );
  },
);

const info = responseHandler(response.info, async () => {
  const data = await dbBase.oneOrNone<ValidatorInfo>(sql.info);

  return { data };
});

export default { info, list };
