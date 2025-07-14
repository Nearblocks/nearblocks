import { Router } from 'express';

import account from '#routes/v3/account';
import blocks from '#routes/v3/blocks';
import txns from '#routes/v3/txns';

const routes = () => {
  const app = Router();

  account(app);
  blocks(app);
  txns(app);

  return app;
};

export default routes;
