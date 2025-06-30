import { Router } from 'express';

import blocks from '#routes/v3/blocks';
import txns from '#routes/v3/txns';

const routes = () => {
  const app = Router();

  blocks(app);
  txns(app);

  return app;
};

export default routes;
