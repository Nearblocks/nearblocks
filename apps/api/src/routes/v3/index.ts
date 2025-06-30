import { Router } from 'express';

import blocks from '#routes/v3/blocks';

const routes = () => {
  const app = Router();

  blocks(app);

  return app;
};

export default routes;
