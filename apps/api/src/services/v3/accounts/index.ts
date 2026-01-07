import type {
  Account,
  AccountBalance,
  AccountBalanceReq,
  AccountReq,
} from 'nb-schemas';
import response from 'nb-schemas/dist/accounts/response.js';

import { dbBalance, dbBase } from '#libs/pgp';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/accounts';

const account = responseHandler(
  response.account,
  async (req: RequestValidator<AccountReq>) => {
    const account = req.validator.account;

    const data = await dbBase.oneOrNone<Account>(sql.account, { account });

    return { data };
  },
);

const balance = responseHandler(
  response.balance,
  async (req: RequestValidator<AccountBalanceReq>) => {
    const account = req.validator.account;

    const data = await dbBalance.oneOrNone<AccountBalance>(sql.balance, {
      account,
    });

    return { data };
  },
);

export default { account, balance };
