import { Router } from 'express';

import account from '#routes/v3/accounts/account';
import keys from '#routes/v3/accounts/keys';
import receipts from '#routes/v3/accounts/receipts';
import txns from '#routes/v3/accounts/txns';

const routes = (app: Router) => {
  account(app);
  keys(app);
  receipts(app);
  txns(app);

  return app;
};

export default routes;
