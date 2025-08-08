import { Router } from 'express';

import accounts from '#routes/v3/accounts/index';
import blocks from '#routes/v3/blocks';
import keys from '#routes/v3/keys';
import multichain from '#routes/v3/multichain/index';
import txns from '#routes/v3/txns';

const routes = () => {
  const app = Router();

  accounts(app);
  blocks(app);
  keys(app);
  multichain(app);
  txns(app);

  return app;
};

export default routes;
