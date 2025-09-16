import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import account from '#routes/v3/accounts/account';
import fts from '#routes/v3/accounts/fts';
import keys from '#routes/v3/accounts/keys';
import receipts from '#routes/v3/accounts/receipts';
import txns from '#routes/v3/accounts/txns';

const route = Router();

const routes = (app: Router) => {
  app.use('/accounts', bearerAuth, rateLimiter, route);

  account(route);
  fts(route);
  keys(route);
  receipts(route);
  txns(route);

  return app;
};

export default routes;
