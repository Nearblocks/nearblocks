import type {
  Account,
  AccountBalance,
  AccountBalanceReq,
  AccountReq,
} from 'nb-schemas';
import response from 'nb-schemas/dist/accounts/response.js';

import dayjs from '#libs/dayjs';
import { dbBalance, dbBase } from '#libs/pgp';
import { msToNsTime } from '#libs/utils';
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
    const { account, block, date } = req.validator;

    if (date) {
      const ms = dayjs.utc(date).add(1, 'day').valueOf();
      const timestamp = msToNsTime(ms);
      const data = await dbBalance.oneOrNone<AccountBalance>(
        sql.balanceHistory,
        { account, timestamp },
      );
      return { data };
    }

    if (block) {
      const blockRow = await dbBase.oneOrNone<{ block_timestamp: string }>(
        'SELECT block_timestamp::TEXT FROM blocks WHERE block_height = $1 LIMIT 1',
        [block],
      );
      if (!blockRow) return { data: null };
      const timestamp = String(BigInt(blockRow.block_timestamp) + 1n);
      const data = await dbBalance.oneOrNone<AccountBalance>(
        sql.balanceHistory,
        { account, timestamp },
      );
      return { data };
    }

    const data = await dbBalance.oneOrNone<AccountBalance>(sql.balance, {
      account,
    });

    return { data };
  },
);

export default { account, balance };
