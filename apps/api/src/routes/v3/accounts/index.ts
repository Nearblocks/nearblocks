import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import account from '#routes/v3/accounts/account';
import assets from '#routes/v3/accounts/assets';
import contract from '#routes/v3/accounts/contract';
import fts from '#routes/v3/accounts/fts';
import keys from '#routes/v3/accounts/keys';
import mts from '#routes/v3/accounts/mts';
import nfts from '#routes/v3/accounts/nfts';
import receipts from '#routes/v3/accounts/receipts';
import staking from '#routes/v3/accounts/staking';
import stats from '#routes/v3/accounts/stats';
import txns from '#routes/v3/accounts/txns';

const route = Router();

const routes = (app: Router) => {
  app.use('/accounts', bearerAuth, rateLimiter, route);

  account(route);
  assets(route);
  contract(route);
  fts(route);
  keys(route);
  mts(route);
  nfts(route);
  receipts(route);
  staking(route);
  stats(route);
  txns(route);

  return app;
};

export default routes;
