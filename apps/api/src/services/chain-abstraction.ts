import { Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import { MultiChainAccounts } from '#libs/schema/chain-abstraction';
import { RequestValidator } from '#types/types';

const multiChainAccounts = catchAsync(
  async (req: RequestValidator<MultiChainAccounts>, res: Response) => {
    const account = req.validator.data.account;

    const multiChainAccounts = await sql`
      SELECT
        account_id,
        derived_address,
        public_key,
        chain,
        path,
        block_height,
        block_timestamp
      FROM
        multichain_accounts
      WHERE
        account_id = ${account}
    `;

    return res.status(200).json({ multiChainAccounts });
  },
);

export default { multiChainAccounts };
