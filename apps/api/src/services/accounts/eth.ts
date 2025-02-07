import { Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import { EthList } from '#libs/schema/accounts';
import { getPagination } from '#libs/utils';
import { RequestValidator } from '#types/types';

const list = catchAsync(
  async (req: RequestValidator<EthList>, res: Response) => {
    const page = req.validator.data.page;
    const per_page = req.validator.data.per_page;
    const { limit, offset } = getPagination(page, per_page);

    const accounts = await sql`
      SELECT
        *
      FROM
        eth_accounts
      LIMIT
        ${limit}
      OFFSET
        ${offset}
    `;

    return res.status(200).json({ accounts });
  },
);

export default { list };
