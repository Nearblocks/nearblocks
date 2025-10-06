import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import account from '#routes/v3/accounts/account';
import contract from '#routes/v3/accounts/contract';
import fts from '#routes/v3/accounts/fts';
import keys from '#routes/v3/accounts/keys';
import nfts from '#routes/v3/accounts/nfts';
import receipts from '#routes/v3/accounts/receipts';
import txns from '#routes/v3/accounts/txns';

const route = Router();

const routes = (app: Router) => {
  app.use('/accounts', bearerAuth, rateLimiter, route);

  account(route);
  contract(route);
  fts(route);
  keys(route);
  nfts(route);
  receipts(route);
  txns(route);

  return app;
};

export default routes;
