import { Router } from 'express';

import accounts from '#routes/v3/accounts/index';
import blocks from '#routes/v3/blocks';
import fts from '#routes/v3/fts/index';
import keys from '#routes/v3/keys';
import multichain from '#routes/v3/multichain/index';
import search from '#routes/v3/search';
import txns from '#routes/v3/txns';

const routes = () => {
  const app = Router();

  accounts(app);
  blocks(app);
  fts(app);
  keys(app);
  multichain(app);
  search(app);
  txns(app);

  return app;
};

export default routes;
