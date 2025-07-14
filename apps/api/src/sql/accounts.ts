import { sql } from '#sql/index';

export default {
  account: sql('queries/accounts/account.sql'),
  balance: sql('queries/accounts/balance.sql'),
};
