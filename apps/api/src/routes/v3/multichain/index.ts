import { Router } from 'express';

import signatures from '#routes/v3/multichain/signatures';

const routes = (app: Router) => {
  signatures(app);

  return app;
};

export default routes;
