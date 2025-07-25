import { Router } from 'express';

import account from '#routes/v3/account';
import blocks from '#routes/v3/blocks';
import multichain from '#routes/v3/multichain';
import txns from '#routes/v3/txns';

const routes = () => {
  const app = Router();

  account(app);
  blocks(app);
  multichain(app);
  txns(app);

  return app;
};

export default routes;
