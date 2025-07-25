import type { Account, AccountReq } from 'nb-schemas';
import response from 'nb-schemas/dist/accounts/response.js';

import { dbBalance, dbBase } from '#libs/pgp';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/accounts';

const account = responseHandler(
  response.account,
  async (req: RequestValidator<AccountReq>) => {
    const account = req.validator.account;

    const [accounts, balance] = await Promise.all([
      dbBase.oneOrNone<Pick<Account, 'account_id' | 'created' | 'deleted'>>(
        sql.account,
        { account },
      ),
      dbBalance.oneOrNone<Omit<Account, 'created' | 'deleted'>>(sql.balance, {
        account,
      }),
    ]);

    if (!accounts || !balance) {
      return { data: null };
    }

    return { data: { ...accounts, ...balance } };
  },
);

export default { account };
