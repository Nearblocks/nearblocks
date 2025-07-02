import { Router } from 'express';

import account from '#routes/v2/account';
import exports from '#routes/v2/exports';
import mt from '#routes/v2/mt';
import txns from '#routes/v2/txns';

const routes = () => {
  const app = Router();

  account(app);
  exports(app);
  txns(app);
  mt(app);

  return app;
};

export default routes;
